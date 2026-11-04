-- Personal one-day coupon codes: claiming, quota, expiry, privacy.

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
insert into offers (id, business_id, kind, title, value_label, status, is_published) values
  ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'אחת', '20%', 'verified', true),
  ('cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'שתיים', '10%', 'verified', true),
  ('cccc0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'שלוש', '15%', 'verified', true),
  ('cccc0000-0000-0000-0000-000000000004', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'ארבע', '5%', 'verified', true),
  ('cccc0000-0000-0000-0000-000000000005', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'פגה', '5%', 'verified', true),
  ('cccc0000-0000-0000-0000-000000000006', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'טיוטה', '5%', 'verified', false);
update offers set valid_until = date '2020-01-01' where id = 'cccc0000-0000-0000-0000-000000000005';
insert into offer_codes (offer_id, coupon_code) values ('cccc0000-0000-0000-0000-000000000001', 'NOA20');

-- ===== visitors =====
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000001')$$, '42501', 'visitors cannot claim codes');
select pg_temp.fails($$select * from code_claims$$, '42501', 'visitors cannot read codes');

-- ===== member one =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);

select pg_temp.eq((select claim_code like 'NOA20-%' and length(claim_code) = 11 from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), true,
  'code carries the offer prefix and a personal suffix');
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')),
  (select code from code_claims where offer_id = 'cccc0000-0000-0000-0000-000000000001'), 'asking again returns the same code');
select pg_temp.eq((select count(*)::int from code_claims), 1, 'no duplicate claim for the same offer');
select pg_temp.eq((select claim_code like 'LIK-%' from claim_offer_code('cccc0000-0000-0000-0000-000000000002')), true,
  'offers without a base code get the default prefix');
select * from claim_offer_code('cccc0000-0000-0000-0000-000000000003');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000004')$$, '54000', 'at most 3 live codes');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000005')$$, 'P0002', 'expired offers give no code');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000006')$$, 'P0002', 'unpublished offers give no code');
select pg_temp.fails($$insert into code_claims (offer_id, user_id, code) values ('cccc0000-0000-0000-0000-000000000004', 'aaaa0000-0000-0000-0000-00000000000a', 'HACK-1')$$,
  '42501', 'members cannot write codes directly');
select pg_temp.fails($$update code_claims set expires_at = now() + interval '30 days'$$, '42501', 'members cannot extend a code');

-- ===== member two sees nothing of member one =====
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from code_claims), 0, 'codes are private to their owner');
select pg_temp.eq((select claim_code like 'NOA20-%' from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), true, 'another member gets her own code');
select pg_temp.eq((select count(distinct code)::int from (select code from code_claims) x), 1, 'she sees only her own');

-- ===== expiry =====
reset role;
update code_claims set expires_at = now() - interval '1 minute' where user_id = 'aaaa0000-0000-0000-0000-00000000000a';
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*)::int from code_claims), 0, 'an expired code is no longer visible');
select * from claim_offer_code('cccc0000-0000-0000-0000-000000000004');
reset role;
select pg_temp.eq((select count(*)::int from code_claims where user_id = 'aaaa0000-0000-0000-0000-00000000000a'), 1,
  'expired codes are deleted and the quota frees up');

\echo 'ALL PERSONAL CODE DB TESTS PASSED'
