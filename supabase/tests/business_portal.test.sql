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
  ('aaaa0000-0000-0000-0000-00000000000a', 'admin@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'owner1@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000c', 'owner2@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000d', 'plain@example.com');
update profiles set role = 'admin' where id = 'aaaa0000-0000-0000-0000-00000000000a';

insert into businesses (id, slug, name, category_slug, is_real_business)
select 'bbbb0000-0000-0000-0000-000000000001', 'biz-one', 'עסק אחד', slug, false from categories limit 1;
insert into businesses (id, slug, name, category_slug, is_real_business)
select 'bbbb0000-0000-0000-0000-000000000002', 'biz-two', 'עסק שני', slug, false from categories limit 1;
insert into offers (id, business_id, kind, title, value_label, status) values
  ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'הטבה של אחד', '10%', 'demo'),
  ('cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000002', 'coupon', 'הטבה של שניים', '20%', 'demo');
insert into analytics_events (event_type, path, offer_id, business_id, visitor_hash) values
  ('offer_view', '/deals/x', 'cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'aaaaaaaaaaaaaaaaaaaa'),
  ('offer_view', '/deals/x', 'cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'bbbbbbbbbbbbbbbbbbbb'),
  ('outbound_click', '/deals/x', 'cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'bbbbbbbbbbbbbbbbbbbb'),
  ('offer_view', '/deals/y', 'cccc0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000002', 'cccccccccccccccccccc');

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((admin_link_business_owner('bbbb0000-0000-0000-0000-000000000001', 'owner1@example.com') ->> 'status'), 'linked', 'admin links owner 1 to business 1');
select admin_link_business_owner('bbbb0000-0000-0000-0000-000000000002', 'OWNER2@example.com');
select pg_temp.fails($$select admin_link_business_owner('bbbb0000-0000-0000-0000-000000000001', 'nobody@example.com')$$, 'P0002', 'unknown email rejected');
select pg_temp.eq((select role::text from profiles where id = 'aaaa0000-0000-0000-0000-00000000000b'), 'business_owner', 'linked member becomes business owner');

select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from my_businesses()), 1, 'owner 1 sees one business');
select pg_temp.eq((select name from my_businesses()), 'עסק אחד', 'owner 1 sees her own business');
select pg_temp.eq((business_stats('bbbb0000-0000-0000-0000-000000000001') -> 'offers' -> 0 ->> 'views')::int, 2, 'owner 1 sees views of her offer');
select pg_temp.eq((business_stats('bbbb0000-0000-0000-0000-000000000001') -> 'offers' -> 0 ->> 'clicks')::int, 1, 'owner 1 sees clicks of her offer');
select pg_temp.fails($$select business_stats('bbbb0000-0000-0000-0000-000000000002')$$, '42501', 'owner 1 cannot read business 2 stats');
select pg_temp.eq((select count(*)::int from business_members), 1, 'owner 1 sees only her own link row');
select pg_temp.fails($$select admin_link_business_owner('bbbb0000-0000-0000-0000-000000000002', 'owner1@example.com')$$, '42501', 'owner cannot link herself to another business');
select pg_temp.fails($$insert into business_members (business_id, user_id) values ('bbbb0000-0000-0000-0000-000000000002', 'aaaa0000-0000-0000-0000-00000000000b')$$, '42501', 'owner cannot insert links directly');

select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000d', false);
select pg_temp.eq((select count(*)::int from my_businesses()), 0, 'plain member has no businesses');
select pg_temp.fails($$select business_stats('bbbb0000-0000-0000-0000-000000000001')$$, '42501', 'plain member cannot read stats');

select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((business_stats('bbbb0000-0000-0000-0000-000000000002') -> 'offers' -> 0 ->> 'views')::int, 1, 'admin reads any business stats');
select admin_unlink_business_owner('bbbb0000-0000-0000-0000-000000000001', 'aaaa0000-0000-0000-0000-00000000000b');
select pg_temp.eq((select role::text from profiles where id = 'aaaa0000-0000-0000-0000-00000000000b'), 'member', 'unlinked owner goes back to member');

reset role;
\echo 'ALL BUSINESS PORTAL DB TESTS PASSED'
