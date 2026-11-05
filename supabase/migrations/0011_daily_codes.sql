-- Daily codes: for some offers the business creates one code per day (e.g. 30 codes, each valid
-- for one day only) and every signed-in member gets that day's code. Codes are admin-only data;
-- members only ever receive today's code through claim_offer_code().
alter table offers add column if not exists code_mode text not null default 'personal';
alter table offers drop constraint if exists offers_code_mode_check;
alter table offers add constraint offers_code_mode_check check (code_mode in ('personal', 'daily'));

create table if not exists offer_daily_codes (
  offer_id uuid not null references offers (id) on delete cascade,
  day date not null,
  code text not null,
  primary key (offer_id, day)
);
alter table offer_daily_codes enable row level security;
revoke all on offer_daily_codes from anon, authenticated;
grant select, insert, update, delete on offer_daily_codes to authenticated;
drop policy if exists "admins manage daily codes" on offer_daily_codes;
create policy "admins manage daily codes" on offer_daily_codes for all
  using (is_admin()) with check (is_admin());

-- A shared (daily) code is held by many members, so uniqueness applies to personal codes only.
alter table code_claims add column if not exists shared boolean not null default false;
alter table code_claims drop constraint if exists code_claims_code_key;
create unique index if not exists code_claims_personal_code on code_claims (code) where not shared;

create or replace function claim_offer_code(p_offer_id uuid)
returns table (claim_code text, claim_expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  max_live constant int := 3;
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  base text;
  new_code text;
  new_expiry timestamptz;
  attempts int := 0;
  v_mode text;
  today date := (now() at time zone 'Asia/Jerusalem')::date;
  daily_code text;
begin
  if uid is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  -- expired codes disappear from the system
  delete from code_claims where expires_at <= now();

  select o.code_mode into v_mode
  from offers o join businesses b on b.id = o.business_id
  where o.id = p_offer_id and o.is_published and b.is_published and o.status <> 'demo'
    and (o.valid_until is null or o.valid_until >= today)
    and (o.starts_on is null or o.starts_on <= today);
  if not found then
    raise exception 'Offer not available' using errcode = 'P0002';
  end if;

  -- asking again returns the code she already has
  return query select c.code, c.expires_at from code_claims c where c.user_id = uid and c.offer_id = p_offer_id;
  if found then return; end if;

  if (select count(*) from code_claims where user_id = uid) >= max_live then
    raise exception 'Code limit reached' using errcode = '54000';
  end if;

  -- "daily" offers: everyone signed in gets the business's code for today, valid until midnight (Israel)
  if v_mode = 'daily' then
    select dc.code into daily_code from offer_daily_codes dc
    where dc.offer_id = p_offer_id and dc.day = today;
    if daily_code is null then
      raise exception 'No code for today' using errcode = 'LK001';
    end if;
    new_expiry := ((today + 1)::timestamp at time zone 'Asia/Jerusalem');
    insert into code_claims (offer_id, user_id, code, expires_at, shared)
    values (p_offer_id, uid, daily_code, new_expiry, true);
    return query select daily_code, new_expiry;
    return;
  end if;

  select upper(left(regexp_replace(oc.coupon_code, '[^A-Za-z0-9]', '', 'g'), 10)) into base
  from offer_codes oc where oc.offer_id = p_offer_id;
  if base is null or base = '' then base := 'LIK'; end if;

  loop
    new_code := base || '-' || (
      select string_agg(substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), '')
      from generate_series(1, 5)
    );
    begin
      insert into code_claims (offer_id, user_id, code) values (p_offer_id, uid, new_code)
      returning code_claims.expires_at into new_expiry;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 10 then raise; end if;
    end;
  end loop;

  return query select new_code, new_expiry;
end;
$$;

revoke all on function claim_offer_code(uuid) from public, anon;
grant execute on function claim_offer_code(uuid) to authenticated;
