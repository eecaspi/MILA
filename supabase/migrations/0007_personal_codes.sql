-- Personal, short-lived coupon codes.
-- A signed-in member asks for a code on an offer; the database creates one just for her,
-- valid for 24 hours. Expired codes are deleted. Each member may hold at most 3 live codes.
-- Members cannot write this table directly: only claim_offer_code() creates rows.

create table code_claims (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  unique (user_id, offer_id)
);
create index code_claims_user on code_claims (user_id, expires_at);

alter table code_claims enable row level security;
revoke all on code_claims from anon, authenticated;
grant select on code_claims to authenticated;
create policy "members read own live codes" on code_claims for select
  using (user_id = auth.uid() and expires_at > now());
create policy "admins read all codes" on code_claims for select using (is_admin());

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
begin
  if uid is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  -- expired codes disappear from the system
  delete from code_claims where expires_at <= now();

  if not exists (
    select 1 from offers o join businesses b on b.id = o.business_id
    where o.id = p_offer_id and o.is_published and b.is_published and o.status <> 'demo'
      and (o.valid_until is null or o.valid_until >= (now() at time zone 'Asia/Jerusalem')::date)
  ) then
    raise exception 'Offer not available' using errcode = 'P0002';
  end if;

  -- asking again returns the code she already has
  return query select c.code, c.expires_at from code_claims c where c.user_id = uid and c.offer_id = p_offer_id;
  if found then return; end if;

  if (select count(*) from code_claims where user_id = uid) >= max_live then
    raise exception 'Code limit reached' using errcode = '54000';
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
