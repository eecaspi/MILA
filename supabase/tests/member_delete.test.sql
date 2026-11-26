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
  ('aaaa0000-0000-0000-0000-00000000000a', 'boss@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'member@example.com'),
  ('aaaa0000-0000-0000-0000-00000000000c', 'other@example.com');
update profiles set role = 'admin' where id = 'aaaa0000-0000-0000-0000-00000000000a';

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000c', false);
select pg_temp.fails($$select admin_delete_member('aaaa0000-0000-0000-0000-00000000000b')$$, '42501', 'members cannot delete members');

select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.fails($$select admin_delete_member('aaaa0000-0000-0000-0000-00000000000a')$$, '22023', 'admin cannot delete self');
select admin_delete_member('aaaa0000-0000-0000-0000-00000000000b');
reset role;
select pg_temp.eq((select count(*)::int from profiles where email = 'member@example.com'), 0, 'member profile is gone');
select pg_temp.eq((select count(*)::int from auth.users where email = 'member@example.com'), 0, 'member login is gone');

insert into auth.users (id, email) values ('aaaa0000-0000-0000-0000-00000000000d', 'member@example.com');
select pg_temp.eq((select count(*)::int from profiles where email = 'member@example.com'), 1, 'same email can join again');

\echo 'ALL MEMBER DELETE DB TESTS PASSED'
