-- Home banners: visitors see published ones only; only admins can change them.

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
  ('aaaa0000-0000-0000-0000-00000000000b', 'member@example.com');
update profiles set role = 'admin' where id = 'aaaa0000-0000-0000-0000-00000000000a';

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
insert into banners (media_url, media_type, title, sort_order, is_published) values
  ('https://x.supabase.co/storage/v1/object/public/media/banners/a.jpg', 'image', 'פעיל', 1, true),
  ('https://x.supabase.co/storage/v1/object/public/media/banners/b.mp4', 'video', 'טיוטה', 2, false);
select pg_temp.eq((select count(*)::int from banners), 2, 'admin sees every banner');
select pg_temp.eq((select count(*)::int from admin_audit_log where action = 'banners.insert'), 2, 'banner changes are audited');
select pg_temp.fails($$insert into banners (media_url, media_type) values ('x', 'gif')$$, '23514', 'unknown media type rejected');

reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.eq((select count(*)::int from banners), 1, 'visitors see published banners only');
select pg_temp.fails($$insert into banners (media_url, media_type) values ('x', 'image')$$, '42501', 'visitors cannot add banners');

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from banners), 1, 'members see published banners only');
select pg_temp.fails($$insert into banners (media_url, media_type) values ('x', 'image')$$, '42501', 'members cannot add banners');
update banners set title = 'שינוי' where true;
select pg_temp.eq((select count(*)::int from banners where title = 'שינוי'), 0, 'members cannot edit banners');
delete from banners where true;
select pg_temp.eq((select count(*)::int from banners), 1, 'members cannot delete banners');

\echo 'ALL BANNER DB TESTS PASSED'
