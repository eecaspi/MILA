-- How a benefit is redeemed. "fixed": one code from the business, the same for every member, valid for
-- the whole offer (the default). "personal": a code made for each member. "daily": the business's code for
-- the day. "link": go to the business's website. "store": redeem at the physical store.
-- Also: an optional redeem link, the terms, and a usage limit shown on the offer.
alter table offers add column if not exists redeem_url text;
alter table offers add column if not exists terms text;
alter table offers add column if not exists usage_limit text;

alter table offers drop constraint if exists offers_code_mode_check;
alter table offers add constraint offers_code_mode_check
  check (code_mode in ('fixed', 'personal', 'daily', 'link', 'store'));
alter table offers alter column code_mode set default 'fixed';

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
  v_until date;
  fixed_code text;
  today date := (now() at time zone 'Asia/Jerusalem')::date;
  daily_code text;
begin
  if uid is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  -- expired codes disappear from the system
  delete from code_claims where expires_at <= now();

  select o.code_mode, o.valid_until into v_mode, v_until
  from offers o join businesses b on b.id = o.business_id
  where o.id = p_offer_id and o.is_published and b.is_published and o.status <> 'demo'
    and (o.valid_until is null or o.valid_until >= today)
    and (o.starts_on is null or o.starts_on <= today);
  if not found then
    raise exception 'Offer not available' using errcode = 'P0002';
  end if;

  -- link and in-store offers have no code to hand out
  if v_mode in ('link', 'store') then
    raise exception 'Offer not available' using errcode = 'P0002';
  end if;

  -- asking again returns the code she already has
  return query select c.code, c.expires_at from code_claims c where c.user_id = uid and c.offer_id = p_offer_id;
  if found then return; end if;

  -- "fixed" offers: the business's one code, the same for every member, valid as long as the offer is.
  -- It is not scarce, so it does not count towards the limit of live personal codes.
  if v_mode = 'fixed' then
    select oc.coupon_code into fixed_code from offer_codes oc where oc.offer_id = p_offer_id;
    if fixed_code is null or fixed_code = '' then
      raise exception 'No code yet' using errcode = 'LK001';
    end if;
    new_expiry := case
      when v_until is null then now() + interval '365 days'
      else ((v_until + 1)::timestamp at time zone 'Asia/Jerusalem')
    end;
    insert into code_claims (offer_id, user_id, code, expires_at, shared)
    values (p_offer_id, uid, fixed_code, new_expiry, true);
    return query select fixed_code, new_expiry;
    return;
  end if;

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
