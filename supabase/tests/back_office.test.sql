-- Back office database tests: publishing, hidden coupon codes, analytics, team, audit.

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

-- fixtures: an admin and a member
insert into auth.users (id, email) values
  ('aaaa0000-0000-0000-0000-00000000000a', 'boss@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'member@example.com');
update profiles set role = 'admin' where id = 'aaaa0000-0000-0000-0000-00000000000a';

-- ===== admin creates content =====
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);

insert into businesses (id, slug, name, category_slug, short_description, is_real_business, status)
values ('bbbb0000-0000-0000-0000-000000000001', 'boutique-noa', 'בוטיק נועה', 'fashion', 'אופנה צנועה', true, 'verified');
insert into offers (id, business_id, kind, title, value_label, status, is_published)
values ('cccc0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'coupon', 'הנחה לחברות', '20% הנחה', 'verified', true);
insert into offer_codes (offer_id, coupon_code) values ('cccc0000-0000-0000-0000-000000000001', 'NOA20');

select pg_temp.eq((select count(*)::int from admin_audit_log where action in ('businesses.insert', 'offers.insert', 'offer_codes.insert')), 3,
  'content changes are audited automatically');
select pg_temp.eq((select actor_id from admin_audit_log where action = 'businesses.insert' limit 1),
  'aaaa0000-0000-0000-0000-00000000000a'::uuid, 'audit records who made the change');
select pg_temp.fails($$insert into businesses (slug, name, category_slug) values ('Bad Slug!', 'שם', 'fashion')$$,
  '23514', 'slugs must be lowercase latin with dashes');
select pg_temp.fails($$insert into businesses (slug, name, category_slug, website) values ('x-site', 'שם', 'fashion', 'javascript:alert(1)')$$,
  '23514', 'website must be an http(s) link');

-- ===== visitors see only published content =====
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.eq((select count(*)::int from businesses where id = 'bbbb0000-0000-0000-0000-000000000001'), 0,
  'unpublished business is hidden from visitors');
select pg_temp.eq((select count(*)::int from offers where id = 'cccc0000-0000-0000-0000-000000000001'), 0,
  'published offer of an unpublished business is hidden');

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
update businesses set is_published = true where id = 'bbbb0000-0000-0000-0000-000000000001';
select pg_temp.eq((select (details ->> 'published')::boolean from admin_audit_log where action = 'businesses.update' order by id desc limit 1),
  true, 'publishing is recorded in the audit log');

reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.eq((select count(*)::int from businesses where id = 'bbbb0000-0000-0000-0000-000000000001'), 1,
  'published business is visible');
select pg_temp.eq((select count(*)::int from offers where id = 'cccc0000-0000-0000-0000-000000000001'), 1,
  'published offer of a published business is visible');
select pg_temp.eq((select count(*)::int from offer_codes), 0, 'visitors cannot read coupon codes');
update businesses set name = 'hacked' where true;
reset role;
select pg_temp.eq((select name from businesses where id = 'bbbb0000-0000-0000-0000-000000000001'), 'בוטיק נועה',
  'visitors cannot edit businesses');
set role anon;
select set_config('request.jwt.claim.sub', '', false);

-- ===== member (signed in, not admin) =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from offer_codes), 0, 'members cannot see coupon codes');
select pg_temp.fails($$insert into businesses (slug, name, category_slug) values ('sneaky', 'עסק', 'fashion')$$,
  '42501', 'members cannot add businesses');
select pg_temp.fails($$select admin_analytics(30)$$, '42501', 'members cannot see analytics');
select pg_temp.fails($$select admin_set_role('member@example.com', 'admin')$$, '42501', 'members cannot promote themselves');

-- ===== tracking (as an anonymous visitor) =====
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select track_event('page_view', '/', 'visitor-hash-0001', 'mobile', null, null, 'google.com', null);
select track_event('page_view', '/deals?x=1', 'visitor-hash-0001', 'mobile', null, null, null, null);
select track_event('page_view', '/', 'visitor-hash-0002', 'desktop', null, null, 'Instagram.com', 'whatsapp');
select track_event('offer_view', '/deals/x', 'visitor-hash-0002', 'desktop', null, 'cccc0000-0000-0000-0000-000000000001', null, null);
select track_event('outbound_click', '/businesses', 'visitor-hash-0002', 'desktop', 'bbbb0000-0000-0000-0000-000000000001', null, null, null);
-- ignored / normalised
select track_event('page_view', '/admin/secret', 'visitor-hash-0003', 'mobile', null, null, null, null);
select track_event('page_view', 'https://evil.example', 'visitor-hash-0003', 'mobile', null, null, null, null);
select track_event('page_view', '/x', 'short', 'mobile', null, null, null, null);
select track_event('offer_view', '/deals/y', 'visitor-hash-0004', 'fridge', null, 'dddd0000-0000-0000-0000-000000000009', null, null);
select pg_temp.eq((select count(*)::int from analytics_events), 0, 'visitors cannot read analytics');
select pg_temp.fails($$insert into analytics_events (event_type, path, visitor_hash) values ('page_view', '/', 'xxxxxxxxxxxxxxxxxx')$$,
  '42501', 'visitors cannot write events directly');

reset role;
select pg_temp.eq((select count(*)::int from analytics_events), 6, 'valid events stored, admin pages and bad input ignored');
select pg_temp.eq((select path from analytics_events where visitor_hash = 'visitor-hash-0001' order by id desc limit 1), '/deals',
  'query strings are stripped from paths');
select pg_temp.eq((select business_id from analytics_events where event_type = 'offer_view' and offer_id is not null),
  'bbbb0000-0000-0000-0000-000000000001'::uuid, 'offer views are attributed to the business');
select pg_temp.eq((select count(*)::int from analytics_events where visitor_hash = 'visitor-hash-0004' and offer_id is null and device = 'other'), 1,
  'unknown offer ids and devices are normalised');
select pg_temp.eq((select referrer_host from analytics_events where visitor_hash = 'visitor-hash-0002' and event_type = 'page_view'), 'instagram.com',
  'referrer hosts are lowercased');

-- ===== analytics dashboard (admin) =====
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((admin_analytics(7) -> 'totals' ->> 'page_views')::int, 3, 'page views counted');
select pg_temp.eq((admin_analytics(7) -> 'totals' ->> 'visitors')::int, 3, 'unique visitors counted');
select pg_temp.eq((admin_analytics(7) -> 'totals' ->> 'outbound_clicks')::int, 1, 'clicks to business sites counted');
select pg_temp.eq(jsonb_array_length(admin_analytics(7) -> 'daily'), 7, 'one row per day, including empty days');
select pg_temp.eq((admin_analytics(7) -> 'top_businesses' -> 0 ->> 'name'), 'בוטיק נועה', 'top businesses listed by name');
select pg_temp.eq((admin_analytics(7) -> 'top_pages' -> 0 ->> 'path'), '/', 'top page is the homepage');
select pg_temp.eq((admin_analytics(9999) ->> 'days')::int, 365, 'range is capped at a year');

-- ===== team =====
select pg_temp.eq(admin_set_role('MEMBER@example.com', 'admin') ->> 'status', 'updated', 'admin promotes a member by email');
select pg_temp.eq((select role::text from profiles where id = 'aaaa0000-0000-0000-0000-00000000000b'), 'admin', 'member is now an admin');
select pg_temp.fails($$select admin_set_role('nobody@example.com', 'admin')$$, 'P0002', 'unknown email is reported');
select pg_temp.eq((select count(*)::int from admin_audit_log where action = 'team.set_role'), 1, 'role changes are audited');

reset role;
update profiles set role = 'member' where role = 'admin' and id <> 'aaaa0000-0000-0000-0000-00000000000a';
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.fails($$select admin_set_role('boss@example.com', 'member')$$, '22023', 'the last admin cannot be removed');

\echo 'ALL BACK OFFICE DB TESTS PASSED'
