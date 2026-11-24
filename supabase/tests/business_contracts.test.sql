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
  ('aaaa0000-0000-0000-0000-00000000000a', 'admin@example.com');
update profiles set role = 'admin' where id = 'aaaa0000-0000-0000-0000-00000000000a';

insert into business_contracts (token, label, terms, template_version)
values ('tok-test-1', 'עסק לדוגמה', '{"commissionPercent": 10}', 'v1');

set role anon;
select pg_temp.eq((select count(*) from business_contracts)::int, 0, 'visitors cannot read the contracts table');
select pg_temp.eq((select count(*) from get_business_contract('tok-test-1'))::int, 1, 'a visitor with the link can read the contract');
select pg_temp.eq((select count(*) from get_business_contract('wrong'))::int, 0, 'a wrong link shows nothing');
select pg_temp.fails($$select sign_business_contract('tok-test-1', 'x', '', '{}', '1.1.1.1', 'ua', 'h')$$, '22023', 'a name is required');
select pg_temp.eq(sign_business_contract('tok-test-1', 'דנה כהן', 'בעלים', '{"a":1}', '1.1.1.1', 'ua', 'hash'), true, 'signing works once');
select pg_temp.eq(sign_business_contract('tok-test-1', 'אחר', '', '{}', '2.2.2.2', 'ua', 'h2'), false, 'a signed contract cannot be signed again');
select pg_temp.eq((select status from get_business_contract('tok-test-1')), 'signed', 'status is signed');
select pg_temp.eq((select signer_name from get_business_contract('tok-test-1')), 'דנה כהן', 'first signature is kept');
reset role;
