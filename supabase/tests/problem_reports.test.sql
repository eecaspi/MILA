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

set role anon;
select submit_problem_report('דנה', '050-1234567', 'הכפתור לא עובד', '/deals');
select submit_problem_report('', '050-1234567', 'שוב', '');
select pg_temp.fails($$select submit_problem_report('', 'x@y.co', '', '')$$, '23514', 'empty message rejected');
select pg_temp.fails($$select count(*) from problem_reports$$, '42501', 'visitors cannot read reports');

reset role;
select pg_temp.eq((select count(*)::int from problem_reports), 1, 'repeat from the same contact is ignored');

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from problem_reports), 0, 'members cannot read reports');
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*)::int from problem_reports), 1, 'admins read reports');

reset role;
\echo 'ALL PROBLEM REPORT DB TESTS PASSED'
