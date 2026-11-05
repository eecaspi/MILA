-- Redeem channel and start date on offers; offers that have not started cannot get a code.

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

insert into auth.users (id, email) values ('aaaa0000-0000-0000-0000-00000000000a', 'one@example.com');
insert into businesses (id, slug, name, category_slug, short_description, is_real_business, status, is_published)
values ('bbbb0000-0000-0000-0000-000000000001', 'boutique-noa', 'בוטיק נועה', 'fashion', 'אופנה', true, 'verified', true);
insert into offers (id, business_id, kind, title, value_label, status, is_published, redeem_channel, starts_on) values
  ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'עכשיו', '20%', 'verified', true, 'online', null),
  ('cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'בקרוב', '10%', 'verified', true, 'store', current_date + 10),
  ('cccc0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'התחיל', '15%', 'verified', true, 'both', current_date - 1);

select pg_temp.fails($$update offers set redeem_channel = 'carrier-pigeon' where id = 'cccc0000-0000-0000-0000-000000000001'$$, '23514', 'unknown channel rejected');
select pg_temp.eq((select redeem_channel from offers where id = 'cccc0000-0000-0000-0000-000000000003'), 'both', 'channel is saved');

-- these tests are about personal codes (new offers default to a fixed code)
update offers set code_mode = 'personal';

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*)::int from claim_offer_code('cccc0000-0000-0000-0000-000000000001')), 1, 'live offer gives a code');
select pg_temp.eq((select count(*)::int from claim_offer_code('cccc0000-0000-0000-0000-000000000003')), 1, 'started offer gives a code');
select pg_temp.fails($$select * from claim_offer_code('cccc0000-0000-0000-0000-000000000002')$$, 'P0002', 'offer that has not started gives no code');

\echo 'ALL OFFER CHANNEL DB TESTS PASSED'
