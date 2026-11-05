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
select submit_business_inquiry('חנות הדוגמה', 'דנה', '050-1234567', 'a@b.co', '', 'שלום', true);
select pg_temp.fails($$select submit_business_inquiry('x', 'y', '0501111111', '', '', '', false)$$, '22023', 'consent is required');
select pg_temp.fails($$select submit_business_inquiry('', 'y', '0501111111', '', '', '', true)$$, '23514', 'empty business name rejected');
select submit_business_inquiry('חנות הדוגמה', 'דנה', '050-1234567', '', '', 'שוב', true);
select pg_temp.fails($$select count(*) from business_inquiries$$, '42501', 'visitors cannot read inquiries');

reset role;
select pg_temp.eq((select count(*)::int from business_inquiries), 1, 'repeat from the same phone within 10 minutes is ignored');

set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*)::int from business_inquiries), 0, 'members cannot read inquiries');
select set_config('request.jwt.claim.sub', 'aaaa0000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*)::int from business_inquiries), 1, 'admins read inquiries');
update business_inquiries set handled = true where true;
select pg_temp.eq((select count(*)::int from business_inquiries where handled), 1, 'admins can mark handled');

reset role;
\echo 'ALL BUSINESS INQUIRY DB TESTS PASSED'
