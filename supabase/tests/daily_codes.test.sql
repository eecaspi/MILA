-- Daily codes: everyone gets today's code, it expires at midnight (Israel), codes are admin-only.

\set ON_ERROR_STOP 1
\set QUIET 1

create function pg_temp.eq(actual anyelement, expected anyelement, label text) returns void
language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'ok - %', label;
end;
$$;

create function pg_temp.fails(stmt text, expected_state text, label text) returns void
language plpgsql as $$
begin
  execute stmt;
  raise exception 'FAIL %: statement succeeded but should have failed', label;
exception
  when others then
    if sqlerrm like 'FAIL %' then raise; end if;
    if expected_state is not null and sqlstate <> expected_state then
      raise exception 'FAIL %: expected SQLSTATE %, got % (%)', label, expected_state, sqlstate, sqlerrm;
    end if;
    raise notice 'ok - % (rejected: %)', label, sqlerrm;
end;
$$;

insert into auth.users (id, email) values
  ('aaaa0000-0000-0000-0000-00000000000a', 'one@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'two@example.com');
insert into businesses (id, slug, name, category_slug, short_description, is_real_business, status, is_published)
values ('bbbb0000-0000-0000-0000-000000000001', 'boutique-noa', 'בוטיק נועה', 'fashion', 'אופנה', true, 'verified', true);
insert into offers (id, business_id, kind, title, value_label, status, is_published, code_mode) values
  ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'יומי', '20%', 'verified', true, 'daily'),
  ('cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'יומי בלי קוד', '10%', 'verified', true, 'daily'),
  ('cccc0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'אישי', '15%', 'verified', true, 'personal');
insert into offer_daily_codes (offer_id, day, code) values
  ('cccc0000-0000-0000-0000-000000000001', (now() at time zone 'Asia/Jerusalem')::date, 'DAY-TODAY'),
  ('cccc0000-0000-0000-0000-000000000001', (now() at time zone 'Asia/Jerusalem')::date + 1, 'DAY-TOMORROW');

select pg_temp.fails($$update offers set code_mode = 'weekly' where id = 'cccc0000-0000-0000-0000-000000000001'$$, '23514', 'unknown code mode rejected');

-- ===== visitors cannot read the daily codes =====
set role anon;
select pg_temp.fails($$select * from offer_daily_codes$$, '42501', 'visitors cannot read daily codes');

-- ===== member one =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*)::int from offer_daily_codes), 0, 'members cannot see the daily codes table');
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 'DAY-TODAY', 'member gets today''s code');
select pg_temp.eq((select claim_expires_at > now() and claim_expires_at <= now() + interval '24 hours' from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), true, 'expires at the end of today');
select pg_temp.eq((select count(*)::int from code_claims), 1, 'asking again does not create a second claim');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000002')$$, 'LK001', 'no code for today gives a clear error');

-- ===== member two gets the very same code =====
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 'DAY-TODAY', 'everyone gets the same code for the day');

-- ===== personal offers still work =====
select pg_temp.eq((select claim_code like 'LIK-%' from claim_offer_code('cccc0000-0000-0000-0000-000000000003')), true, 'personal offers still get personal codes');

\echo 'ALL DAILY CODE DB TESTS PASSED'
