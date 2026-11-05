-- Redeem types: fixed code (default), link and store offers, terms fields.

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

-- a new offer is "fixed" unless said otherwise
insert into offers (id, business_id, kind, title, value_label, status, is_published, valid_until, terms, usage_limit, redeem_url) values
  ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'קבוע', '20%', 'verified', true, (now() at time zone 'Asia/Jerusalem')::date + 5, 'לא כולל מבצעים', 'פעם אחת ללקוחה', null),
  ('cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'בלי קוד', '10%', 'verified', true, null, null, null, null),
  ('cccc0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'deal', 'קישור', '5%', 'verified', true, null, null, null, 'https://example.com/sale'),
  ('cccc0000-0000-0000-0000-000000000004', 'bbbb0000-0000-0000-0000-000000000001', 'deal', 'בחנות', '5%', 'verified', true, null, null, null, null);
update offers set code_mode = 'link' where id = 'cccc0000-0000-0000-0000-000000000003';
update offers set code_mode = 'store' where id = 'cccc0000-0000-0000-0000-000000000004';
insert into offer_codes (offer_id, coupon_code) values
  ('cccc0000-0000-0000-0000-000000000001', 'NOA20');

select pg_temp.eq((select code_mode from offers where id = 'cccc0000-0000-0000-0000-000000000001'), 'fixed', 'default redeem type is a fixed code');
select pg_temp.fails($$update offers set code_mode = 'weekly' where id = 'cccc0000-0000-0000-0000-000000000001'$$, '23514', 'unknown redeem type rejected');

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);

-- fixed code: she gets the business's own code, valid until the end of the offer's last day
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 'NOA20', 'fixed code is handed out as is');
select pg_temp.eq((select count(*)::int from code_claims where offer_id = 'cccc0000-0000-0000-0000-000000000001'), 1, 'the claim is saved');
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 'NOA20', 'asking again returns the same code');
select pg_temp.eq((select (expires_at > now() + interval '4 days') and (expires_at < now() + interval '7 days') from code_claims where offer_id = 'cccc0000-0000-0000-0000-000000000001'), true, 'fixed code lasts until the offer ends');

-- no code yet
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000002')$$, 'LK001', 'fixed offer without a code says so');

-- link and store offers have nothing to claim
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000003')$$, 'P0002', 'link offers have no code');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000004')$$, 'P0002', 'store offers have no code');

-- the same fixed code is shared, so a second member gets it too
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select claim_code from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 'NOA20', 'every member gets the same fixed code');

\echo 'ALL REDEEM TYPE DB TESTS PASSED'
