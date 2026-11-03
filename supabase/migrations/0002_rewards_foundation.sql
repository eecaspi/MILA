-- MILA Rewards foundation
--
-- Design:
--   * points_transactions is an append-only ledger. Balances are always derived
--     from it (view points_balances); there is no editable balance column.
--   * Clients can only READ their own rows. Every write goes through a
--     SECURITY DEFINER function below, which validates on the server.
--   * Every write carries a unique idempotency_key, so retries never double-award.
--   * Points have no monetary value in this schema. Purchase rules convert
--     affiliate COMMISSION into points at a configurable per-business rate.
--   * Nothing awards points until an admin turns the program on
--     (rewards_program.is_enabled) and activates a rule.
--
-- Plain-language summary of the balance identity (enforced by the view):
--   available = earned - redeemed - expired     (confirmed rows only)
--   pending   = sum of pending rows             (purchase rewards awaiting verification)

-- =====================================================================
-- Profiles: account details, auto-creation on sign-up, safe self-editing
-- =====================================================================

alter table profiles
  add column if not exists email text,
  add column if not exists city text,
  add column if not exists updated_at timestamptz not null default now();

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Users may edit their own profile, but never their role or email.
create policy "own profile update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create or replace function protect_profile_fields() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only admins can change roles' using errcode = '42501';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Email is managed by authentication' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on profiles
  for each row execute function protect_profile_fields();

-- =====================================================================
-- Communication preferences (future WhatsApp / SMS opt-in; off by default)
-- =====================================================================

create type notification_channel as enum ('email', 'whatsapp', 'sms');

create table notification_preferences (
  user_id uuid not null references profiles (id) on delete cascade,
  channel notification_channel not null,
  opted_in boolean not null default false,
  opted_in_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, channel)
);

alter table notification_preferences enable row level security;
create policy "own notification prefs read" on notification_preferences for select
  using (user_id = auth.uid() or is_admin());
create policy "own notification prefs write" on notification_preferences for insert
  with check (user_id = auth.uid());
create policy "own notification prefs update" on notification_preferences for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================================
-- Rewards: types
-- =====================================================================

create type points_tx_type as enum ('earn', 'redeem', 'reversal', 'adjustment', 'expiration');
create type points_tx_source as enum ('purchase', 'activity', 'admin', 'redemption', 'system');
create type points_tx_status as enum ('pending', 'confirmed', 'cancelled');
create type earning_rule_kind as enum ('purchase', 'activity');
create type earning_frequency as enum ('once', 'daily', 'weekly', 'monthly', 'unlimited');
create type conversion_status as enum ('pending', 'approved', 'cancelled', 'refunded');

-- =====================================================================
-- Program switch (single row). Off until the business model is final.
-- =====================================================================

create table rewards_program (
  id boolean primary key default true check (id),
  is_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id)
);
insert into rewards_program (id) values (true);

-- =====================================================================
-- Earning rules
-- =====================================================================

create table earning_rules (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (key ~ '^[a-z0-9_]+$'),
  kind earning_rule_kind not null,
  title text not null,
  description text not null default '',
  -- activity rules: fixed points per completion
  points integer check (points > 0),
  -- purchase rules: points per 1 ILS of affiliate commission actually earned by MILA
  points_per_commission_shekel numeric(10, 4) check (points_per_commission_shekel > 0),
  -- purchase rules: specific business, or NULL for the default rate
  business_id uuid references businesses (id) on delete cascade,
  frequency earning_frequency not null default 'once',
  max_per_user integer check (max_per_user > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  -- declarative conditions, e.g. {"required_profile_fields": ["display_name", "city"]}
  eligibility jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  -- true only once server-side verification for this activity exists in code
  is_implemented boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint earning_rules_shape check (
    (kind = 'activity' and points is not null and points_per_commission_shekel is null and business_id is null)
    or (kind = 'purchase' and points_per_commission_shekel is not null and points is null)
  ),
  constraint earning_rules_window check (ends_at is null or starts_at is null or ends_at > starts_at),
  -- an activity nobody can verify must never be switched on
  constraint earning_rules_active_needs_impl check (not is_active or is_implemented)
);

-- At most one purchase rule per business, plus one default (business_id NULL).
create unique index earning_rules_one_purchase_rule
  on earning_rules (coalesce(business_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where kind = 'purchase';

-- =====================================================================
-- Affiliate conversions (purchases reported by affiliate networks)
-- =====================================================================

create table affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  network text not null,
  external_id text not null,
  user_id uuid references profiles (id) on delete set null,
  business_id uuid references businesses (id) on delete set null,
  referral_link_id uuid references referral_links (id) on delete set null,
  order_amount_agorot integer check (order_amount_agorot >= 0),
  commission_agorot integer not null check (commission_agorot >= 0),
  status conversion_status not null default 'pending',
  occurred_at timestamptz not null,
  status_updated_at timestamptz not null default now(),
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (network, external_id)
);

-- =====================================================================
-- Points ledger
-- =====================================================================

create table points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete restrict,
  type points_tx_type not null,
  source points_tx_source not null,
  status points_tx_status not null,
  amount integer not null check (amount <> 0),
  rule_id uuid references earning_rules (id),
  conversion_id uuid references affiliate_conversions (id),
  activity_ref text,
  reverses_transaction_id uuid unique references points_transactions (id),
  idempotency_key text not null unique,
  note text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint points_tx_sign check (
    (type = 'earn' and amount > 0)
    or (type in ('redeem', 'expiration') and amount < 0)
    or type in ('reversal', 'adjustment')
  ),
  constraint points_tx_purchase_ref check (source <> 'purchase' or conversion_id is not null),
  constraint points_tx_reversal_ref check ((type = 'reversal') = (reverses_transaction_id is not null)),
  -- only purchase rewards wait for verification
  constraint points_tx_pending_only_purchase check (
    status <> 'pending' or (type = 'earn' and source = 'purchase')
  )
);

create index points_tx_user_created on points_transactions (user_id, created_at desc);
create index points_tx_rule_user on points_transactions (rule_id, user_id) where rule_id is not null;
create index points_tx_conversion on points_transactions (conversion_id) where conversion_id is not null;

-- The ledger is append-only: rows are never deleted, and the only allowed
-- change is a status transition pending -> confirmed | cancelled.
create or replace function guard_points_tx_change() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'points_transactions is append-only' using errcode = '42501';
  end if;
  if (new.id, new.user_id, new.type, new.source, new.amount, new.rule_id, new.conversion_id,
      new.activity_ref, new.reverses_transaction_id, new.idempotency_key, new.created_by, new.created_at)
     is distinct from
     (old.id, old.user_id, old.type, old.source, old.amount, old.rule_id, old.conversion_id,
      old.activity_ref, old.reverses_transaction_id, old.idempotency_key, old.created_by, old.created_at) then
    raise exception 'Only the status of a points transaction can change' using errcode = '42501';
  end if;
  if new.status is distinct from old.status
     and not (old.status = 'pending' and new.status in ('confirmed', 'cancelled')) then
    raise exception 'Invalid status change % -> %', old.status, new.status using errcode = '22023';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger points_tx_guard_update before update on points_transactions
  for each row execute function guard_points_tx_change();
create trigger points_tx_guard_delete before delete on points_transactions
  for each row execute function guard_points_tx_change();

-- Serialize all ledger writes per user, then refuse anything that would leave the
-- available balance negative. Reversals are the one explicit exception: undoing a
-- reward the user already spent is recorded truthfully, even if it creates a deficit.
create or replace function lock_user_points(p_user uuid) returns void
language sql as $$
  select pg_advisory_xact_lock(hashtextextended('points:' || p_user::text, 0));
$$;

create or replace function enforce_non_negative_balance() returns trigger
language plpgsql set search_path = public as $$
declare
  v_available bigint;
begin
  if new.status <> 'confirmed' or new.amount > 0 or new.type = 'reversal' then
    return null;
  end if;
  perform lock_user_points(new.user_id);
  select coalesce(sum(amount), 0) into v_available
  from points_transactions where user_id = new.user_id and status = 'confirmed';
  if v_available < 0 then
    raise exception 'Insufficient points (balance would be %)', v_available using errcode = '23514';
  end if;
  return null;
end;
$$;

create trigger points_tx_non_negative after insert or update on points_transactions
  for each row execute function enforce_non_negative_balance();

-- =====================================================================
-- Balances (always derived from the ledger)
-- =====================================================================

create view points_balances with (security_invoker = true) as
select
  p.id as user_id,
  coalesce(sum(t.amount) filter (where t.status = 'confirmed'), 0)::integer as available,
  coalesce(sum(t.amount) filter (where t.status = 'pending'), 0)::integer as pending,
  coalesce(sum(t.amount) filter (
    where t.status = 'confirmed' and t.source <> 'redemption' and t.type <> 'expiration'
  ), 0)::integer as total_earned,
  coalesce(-sum(t.amount) filter (where t.status = 'confirmed' and t.source = 'redemption'), 0)::integer
    as total_redeemed,
  coalesce(-sum(t.amount) filter (where t.status = 'confirmed' and t.type = 'expiration'), 0)::integer
    as total_expired
from profiles p
left join points_transactions t on t.user_id = p.id
group by p.id;

-- =====================================================================
-- Admin audit log
-- =====================================================================

create table admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles (id),
  action text not null,
  target_user_id uuid references profiles (id),
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_created on admin_audit_log (created_at desc);

create or replace function guard_audit_log_change() returns trigger
language plpgsql as $$
begin
  raise exception 'admin_audit_log is append-only' using errcode = '42501';
end;
$$;
create trigger admin_audit_log_immutable before update or delete on admin_audit_log
  for each row execute function guard_audit_log_change();

-- =====================================================================
-- Row level security: read-only for users, writes only via functions
-- =====================================================================

alter table rewards_program enable row level security;
alter table earning_rules enable row level security;
alter table affiliate_conversions enable row level security;
alter table points_transactions enable row level security;
alter table admin_audit_log enable row level security;

create policy "program readable" on rewards_program for select using (true);
create policy "active rules readable" on earning_rules for select
  using ((is_active and kind = 'activity') or is_admin());
create policy "own conversions readable" on affiliate_conversions for select
  using (user_id = auth.uid() or is_admin());
create policy "own points readable" on points_transactions for select
  using (user_id = auth.uid() or is_admin());
create policy "admins read audit log" on admin_audit_log for select using (is_admin());

-- Defense in depth: no direct writes from API roles at all.
revoke insert, update, delete, truncate on
  rewards_program, earning_rules, affiliate_conversions, points_transactions, admin_audit_log
  from anon, authenticated;
revoke all on points_balances from anon;
grant select on points_balances to authenticated;

-- =====================================================================
-- Internal helpers (not callable through the API)
-- =====================================================================

create or replace function _rewards_enabled() returns boolean
language sql stable security definer set search_path = public as $$
  select is_enabled from rewards_program where id;
$$;

-- Period bucket used for frequency limits, in Israel time.
create or replace function _period_key(p_frequency earning_frequency, p_at timestamptz) returns text
language sql immutable as $$
  select case p_frequency
    when 'once' then 'once'
    when 'daily' then to_char(p_at at time zone 'Asia/Jerusalem', 'YYYY-MM-DD')
    when 'weekly' then to_char(p_at at time zone 'Asia/Jerusalem', 'IYYY-"W"IW')
    when 'monthly' then to_char(p_at at time zone 'Asia/Jerusalem', 'YYYY-MM')
    else null
  end;
$$;

-- Awards an activity rule to a user if every rule condition holds.
-- Returns {"status": "awarded" | "already_awarded" | "not_eligible", ...}.
create or replace function _award_activity(
  p_user uuid, p_rule_key text, p_ref text default null, p_now timestamptz default now()
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  r earning_rules;
  v_period text;
  v_key text;
  v_count integer;
  v_tx points_transactions;
begin
  if not _rewards_enabled() then
    return jsonb_build_object('status', 'not_eligible', 'reason', 'program_disabled');
  end if;

  select * into r from earning_rules where key = p_rule_key and kind = 'activity';
  if not found or not r.is_active then
    return jsonb_build_object('status', 'not_eligible', 'reason', 'rule_inactive');
  end if;
  if (r.starts_at is not null and p_now < r.starts_at) or (r.ends_at is not null and p_now >= r.ends_at) then
    return jsonb_build_object('status', 'not_eligible', 'reason', 'outside_campaign_window');
  end if;

  v_period := _period_key(r.frequency, p_now);
  if v_period is null then
    -- unlimited: each occurrence must be identified by the caller
    if p_ref is null or length(p_ref) = 0 then
      raise exception 'Unlimited activities need an occurrence reference' using errcode = '22023';
    end if;
    v_period := 'ref:' || p_ref;
  end if;
  v_key := format('activity:%s:%s:%s', r.key, p_user, v_period);

  perform lock_user_points(p_user);

  select * into v_tx from points_transactions where idempotency_key = v_key;
  if found then
    return jsonb_build_object('status', 'already_awarded', 'transaction_id', v_tx.id, 'points', v_tx.amount);
  end if;

  if r.max_per_user is not null then
    select count(*) into v_count from points_transactions
    where user_id = p_user and rule_id = r.id and type = 'earn' and status <> 'cancelled';
    if v_count >= r.max_per_user then
      return jsonb_build_object('status', 'not_eligible', 'reason', 'max_per_user_reached');
    end if;
  end if;

  insert into points_transactions (user_id, type, source, status, amount, rule_id, activity_ref, idempotency_key)
  values (p_user, 'earn', 'activity', 'confirmed', r.points, r.id, v_period, v_key)
  returning * into v_tx;

  return jsonb_build_object('status', 'awarded', 'transaction_id', v_tx.id, 'points', v_tx.amount);
end;
$$;

-- Points for a conversion under the purchase rule in force (business-specific, else default).
create or replace function _purchase_points(p_business uuid, p_commission_agorot integer)
returns table (rule_id uuid, points integer)
language sql stable security definer set search_path = public as $$
  select r.id, floor(p_commission_agorot / 100.0 * r.points_per_commission_shekel)::integer
  from earning_rules r
  where r.kind = 'purchase' and r.is_active
    and (r.starts_at is null or r.starts_at <= now())
    and (r.ends_at is null or r.ends_at > now())
    and (r.business_id = p_business or r.business_id is null)
  order by r.business_id is null  -- business-specific rule wins
  limit 1;
$$;

-- Applies a conversion's current status to the ledger. Idempotent.
create or replace function _sync_conversion_points(p_conversion uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c affiliate_conversions;
  v_rule uuid;
  v_points integer;
  v_tx points_transactions;
  v_reversal points_transactions;
begin
  select * into c from affiliate_conversions where id = p_conversion;
  if c.user_id is null then
    return jsonb_build_object('points_status', 'no_user');
  end if;

  perform lock_user_points(c.user_id);

  -- the live reward row for this conversion, if any (latest non-cancelled earn)
  select * into v_tx from points_transactions
  where conversion_id = c.id and type = 'earn' and status <> 'cancelled'
  order by created_at desc limit 1;

  if c.status in ('cancelled', 'refunded') then
    if v_tx.id is null then
      return jsonb_build_object('points_status', 'none');
    elsif v_tx.status = 'pending' then
      update points_transactions set status = 'cancelled' where id = v_tx.id;
      return jsonb_build_object('points_status', 'cancelled', 'transaction_id', v_tx.id);
    else
      insert into points_transactions (user_id, type, source, status, amount, conversion_id,
        reverses_transaction_id, idempotency_key, note)
      values (c.user_id, 'reversal', 'purchase', 'confirmed', -v_tx.amount, c.id,
        v_tx.id, 'purchase-reversal:' || v_tx.id, 'Purchase ' || c.status::text)
      on conflict (idempotency_key) do nothing
      returning * into v_reversal;
      return jsonb_build_object('points_status', 'reversed', 'transaction_id', coalesce(v_reversal.id, v_tx.id));
    end if;
  end if;

  if not _rewards_enabled() then
    return jsonb_build_object('points_status', 'program_disabled');
  end if;

  select rule_id, points into v_rule, v_points from _purchase_points(c.business_id, c.commission_agorot);
  if v_rule is null then
    return jsonb_build_object('points_status', 'no_active_purchase_rule');
  end if;
  if v_points < 1 then
    return jsonb_build_object('points_status', 'below_one_point');
  end if;

  if c.status = 'pending' then
    if v_tx.id is null then
      insert into points_transactions (user_id, type, source, status, amount, rule_id, conversion_id, idempotency_key)
      values (c.user_id, 'earn', 'purchase', 'pending', v_points, v_rule, c.id, 'purchase:' || c.id || ':pending')
      on conflict (idempotency_key) do nothing
      returning * into v_tx;
    end if;
    return jsonb_build_object('points_status', 'pending', 'transaction_id', v_tx.id);
  end if;

  -- approved
  if v_tx.id is not null and v_tx.status = 'confirmed' then
    return jsonb_build_object('points_status', 'confirmed', 'transaction_id', v_tx.id);
  end if;
  if v_tx.id is not null and v_tx.amount = v_points then
    update points_transactions set status = 'confirmed' where id = v_tx.id;
    return jsonb_build_object('points_status', 'confirmed', 'transaction_id', v_tx.id);
  end if;
  -- commission changed between pending and approval: cancel the estimate, book the final amount
  if v_tx.id is not null then
    update points_transactions set status = 'cancelled' where id = v_tx.id;
  end if;
  insert into points_transactions (user_id, type, source, status, amount, rule_id, conversion_id, idempotency_key)
  values (c.user_id, 'earn', 'purchase', 'confirmed', v_points, v_rule, c.id, 'purchase:' || c.id || ':approved')
  on conflict (idempotency_key) do nothing
  returning * into v_tx;
  return jsonb_build_object('points_status', 'confirmed', 'transaction_id', v_tx.id);
end;
$$;

create or replace function _audit(
  p_action text, p_target_user uuid, p_target_id text, p_details jsonb
) returns void
language sql security definer set search_path = public as $$
  insert into admin_audit_log (actor_id, action, target_user_id, target_id, details)
  values (auth.uid(), p_action, p_target_user, p_target_id, coalesce(p_details, '{}'::jsonb));
$$;

create or replace function _require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
end;
$$;

-- =====================================================================
-- API: members
-- =====================================================================

-- Awards the profile-completion bonus. The conditions are checked here against the
-- stored profile, never against anything the client sends.
create or replace function claim_profile_completion() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_profile jsonb;
  v_rule earning_rules;
  v_field text;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if not _rewards_enabled() then
    return jsonb_build_object('status', 'not_eligible', 'reason', 'program_disabled');
  end if;
  select * into v_rule from earning_rules where key = 'profile_completed';
  if not found or not v_rule.is_active then
    return jsonb_build_object('status', 'not_eligible', 'reason', 'rule_inactive');
  end if;
  select to_jsonb(p) into v_profile from profiles p where id = v_uid;
  for v_field in select jsonb_array_elements_text(coalesce(v_rule.eligibility -> 'required_profile_fields', '[]'))
  loop
    if length(trim(coalesce(v_profile ->> v_field, ''))) < 2 then
      return jsonb_build_object('status', 'not_eligible', 'reason', 'profile_incomplete', 'field', v_field);
    end if;
  end loop;
  return _award_activity(v_uid, 'profile_completed');
end;
$$;

-- =====================================================================
-- API: affiliate integrations (server-to-server only, via service role)
-- =====================================================================

-- Records or updates a conversion reported by an affiliate network, then syncs points.
-- Allowed transitions: pending -> approved | cancelled | refunded; approved -> cancelled | refunded.
create or replace function record_conversion(
  p_network text,
  p_external_id text,
  p_status conversion_status,
  p_commission_agorot integer,
  p_occurred_at timestamptz,
  p_user uuid default null,
  p_business uuid default null,
  p_order_amount_agorot integer default null,
  p_referral_link uuid default null,
  p_raw jsonb default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c affiliate_conversions;
  v_points jsonb;
begin
  select * into c from affiliate_conversions where network = p_network and external_id = p_external_id for update;

  if not found then
    insert into affiliate_conversions (network, external_id, user_id, business_id, referral_link_id,
      order_amount_agorot, commission_agorot, status, occurred_at, raw)
    values (p_network, p_external_id, p_user, p_business, p_referral_link,
      p_order_amount_agorot, p_commission_agorot, p_status, p_occurred_at, p_raw)
    returning * into c;
  elsif c.status = p_status and c.commission_agorot = p_commission_agorot then
    null; -- duplicate delivery: nothing changes
  elsif c.status in ('cancelled', 'refunded') then
    raise exception 'Conversion % is already %', c.id, c.status using errcode = '22023';
  elsif c.status = 'approved' and p_status not in ('approved', 'cancelled', 'refunded') then
    raise exception 'Conversion % cannot go from approved to %', c.id, p_status using errcode = '22023';
  else
    update affiliate_conversions
    set status = p_status, commission_agorot = p_commission_agorot, status_updated_at = now(),
        raw = coalesce(p_raw, raw)
    where id = c.id
    returning * into c;
  end if;

  v_points := _sync_conversion_points(c.id);
  return jsonb_build_object('conversion_id', c.id, 'status', c.status) || v_points;
end;
$$;

-- =====================================================================
-- API: admins (every call is authorized here and written to the audit log)
-- =====================================================================

create or replace function admin_adjust_points(
  p_user uuid, p_amount integer, p_reason text, p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_tx points_transactions;
begin
  perform _require_admin();
  if p_amount is null or p_amount = 0 then
    raise exception 'Amount must be non-zero' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;

  perform lock_user_points(p_user);
  insert into points_transactions (user_id, type, source, status, amount, idempotency_key, note, created_by)
  values (p_user, 'adjustment', 'admin', 'confirmed', p_amount, 'admin-adjust:' || p_request_id, trim(p_reason), auth.uid())
  on conflict (idempotency_key) do nothing
  returning * into v_tx;

  if v_tx.id is null then
    select * into v_tx from points_transactions where idempotency_key = 'admin-adjust:' || p_request_id;
    return jsonb_build_object('status', 'already_applied', 'transaction_id', v_tx.id);
  end if;

  perform _audit('points.adjust', p_user, v_tx.id::text,
    jsonb_build_object('amount', p_amount, 'reason', trim(p_reason)));
  return jsonb_build_object('status', 'applied', 'transaction_id', v_tx.id);
end;
$$;

create or replace function admin_reverse_transaction(p_transaction uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t points_transactions;
  v_rev points_transactions;
begin
  perform _require_admin();
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;

  select * into t from points_transactions where id = p_transaction;
  if not found then
    raise exception 'Transaction not found' using errcode = 'P0002';
  end if;
  perform lock_user_points(t.user_id);

  if t.type = 'reversal' then
    raise exception 'A reversal cannot be reversed' using errcode = '22023';
  elsif t.status = 'cancelled' then
    raise exception 'Transaction is already cancelled' using errcode = '22023';
  elsif t.status = 'pending' then
    update points_transactions set status = 'cancelled' where id = t.id;
    perform _audit('points.cancel_pending', t.user_id, t.id::text, jsonb_build_object('reason', trim(p_reason)));
    return jsonb_build_object('status', 'cancelled', 'transaction_id', t.id);
  end if;

  insert into points_transactions (user_id, type, source, status, amount, rule_id, conversion_id,
    reverses_transaction_id, idempotency_key, note, created_by)
  values (t.user_id, 'reversal', t.source, 'confirmed', -t.amount, t.rule_id, t.conversion_id,
    t.id, 'reversal:' || t.id, trim(p_reason), auth.uid())
  on conflict (idempotency_key) do nothing
  returning * into v_rev;

  if v_rev.id is null then
    return jsonb_build_object('status', 'already_reversed');
  end if;
  perform _audit('points.reverse', t.user_id, t.id::text,
    jsonb_build_object('reason', trim(p_reason), 'reversal_id', v_rev.id, 'amount', -t.amount));
  return jsonb_build_object('status', 'reversed', 'transaction_id', v_rev.id);
end;
$$;

create or replace function admin_set_rule_active(p_rule uuid, p_active boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  r earning_rules;
begin
  perform _require_admin();
  select * into r from earning_rules where id = p_rule;
  if not found then
    raise exception 'Rule not found' using errcode = 'P0002';
  end if;
  if p_active and not r.is_implemented then
    raise exception 'This activity is not verifiable yet and cannot be activated' using errcode = '22023';
  end if;
  update earning_rules set is_active = p_active, updated_at = now() where id = p_rule;
  perform _audit('rule.set_active', null, p_rule::text, jsonb_build_object('key', r.key, 'active', p_active));
  return jsonb_build_object('status', 'updated');
end;
$$;

create or replace function admin_set_program_enabled(p_enabled boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _require_admin();
  update rewards_program set is_enabled = p_enabled, updated_at = now(), updated_by = auth.uid() where id;
  perform _audit('program.set_enabled', null, null, jsonb_build_object('enabled', p_enabled));
  return jsonb_build_object('status', 'updated');
end;
$$;

-- Manual review of a reported purchase (e.g. confirming after the network's lock period).
create or replace function admin_set_conversion_status(
  p_conversion uuid, p_status conversion_status, p_reason text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c affiliate_conversions;
  v_result jsonb;
begin
  perform _require_admin();
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;
  select * into c from affiliate_conversions where id = p_conversion;
  if not found then
    raise exception 'Conversion not found' using errcode = 'P0002';
  end if;
  v_result := record_conversion(c.network, c.external_id, p_status, c.commission_agorot, c.occurred_at);
  perform _audit('conversion.set_status', c.user_id, c.id::text,
    jsonb_build_object('from', c.status, 'to', p_status, 'reason', trim(p_reason)));
  return v_result;
end;
$$;

create or replace function admin_rewards_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
begin
  perform _require_admin();
  select jsonb_build_object(
    'members', (select count(*) from profiles),
    'members_with_points', (select count(*) from points_balances where available <> 0 or pending <> 0),
    'points_available', (select coalesce(sum(available), 0) from points_balances),
    'points_pending', (select coalesce(sum(pending), 0) from points_balances),
    'points_earned_30d', (select coalesce(sum(amount), 0) from points_transactions
      where status = 'confirmed' and amount > 0 and source <> 'redemption' and created_at > now() - interval '30 days'),
    'pending_conversions', (select count(*) from affiliate_conversions where status = 'pending'),
    'program_enabled', _rewards_enabled()
  ) into v;
  return v;
end;
$$;

-- =====================================================================
-- Function privileges. Postgres grants EXECUTE to PUBLIC by default,
-- so revoke everything first and grant only what each caller needs.
-- =====================================================================

revoke all on function
  handle_new_user(), protect_profile_fields(), guard_points_tx_change(), lock_user_points(uuid),
  enforce_non_negative_balance(), guard_audit_log_change(), _rewards_enabled(),
  _period_key(earning_frequency, timestamptz), _award_activity(uuid, text, text, timestamptz),
  _purchase_points(uuid, integer), _sync_conversion_points(uuid), _audit(text, uuid, text, jsonb),
  _require_admin(),
  claim_profile_completion(),
  record_conversion(text, text, conversion_status, integer, timestamptz, uuid, uuid, integer, uuid, jsonb),
  admin_adjust_points(uuid, integer, text, uuid), admin_reverse_transaction(uuid, text),
  admin_set_rule_active(uuid, boolean), admin_set_program_enabled(boolean),
  admin_set_conversion_status(uuid, conversion_status, text), admin_rewards_stats()
from public, anon, authenticated;

grant execute on function claim_profile_completion() to authenticated;
grant execute on function
  admin_adjust_points(uuid, integer, text, uuid), admin_reverse_transaction(uuid, text),
  admin_set_rule_active(uuid, boolean), admin_set_program_enabled(boolean),
  admin_set_conversion_status(uuid, conversion_status, text), admin_rewards_stats()
to authenticated;
grant execute on function
  record_conversion(text, text, conversion_status, integer, timestamptz, uuid, uuid, integer, uuid, jsonb)
to service_role;

-- =====================================================================
-- Seed rules. All start inactive. Only profile completion is verifiable today.
-- =====================================================================

insert into earning_rules (key, kind, title, description, points, frequency, max_per_user, eligibility, is_implemented)
values
  ('profile_completed', 'activity', 'השלמת פרופיל', 'מילאת שם ועיר בפרופיל האישי', 50, 'once', 1,
    '{"required_profile_fields": ["display_name", "city"]}', true),
  ('survey_completed', 'activity', 'מילוי סקר', 'השתתפות בסקר קהילתי', 20, 'unlimited', null, '{}', false),
  ('challenge_completed', 'activity', 'השלמת אתגר', 'השלמת אתגר קהילתי', 30, 'weekly', null, '{}', false),
  ('friend_referred', 'activity', 'הזמנת חברה', 'חברה שהזמנת הצטרפה ואימתה חשבון', 100, 'unlimited', 10, '{}', false),
  ('business_discovered', 'activity', 'גילוי עסק חדש', 'ביקור בעמוד של עסק חדש', 5, 'daily', null, '{}', false),
  ('campaign_participation', 'activity', 'השתתפות בקמפיין', 'השתתפות בקמפיין קידום', 25, 'once', null, '{}', false);

-- Default purchase rule. Not implemented until an affiliate network feeds
-- verified conversions into record_conversion(), so it cannot be switched on yet.
insert into earning_rules (key, kind, title, description, points_per_commission_shekel, is_implemented)
values ('purchase_default', 'purchase', 'קנייה דרך MILA', 'נקודות על קנייה מאומתת דרך קישור של MILA', 1, false);
