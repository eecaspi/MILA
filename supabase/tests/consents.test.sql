-- Sign-up consents are recorded with a server-side timestamp.

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

insert into auth.users (id, email, raw_user_meta_data) values
  ('bbbb0000-0000-0000-0000-0000000000b1', 'both@example.com', '{"terms_accepted":"true","terms_version":"v1","marketing_consent":"true"}'),
  ('bbbb0000-0000-0000-0000-0000000000b2', 'terms@example.com', '{"terms_accepted":"true","terms_version":"v1"}'),
  ('bbbb0000-0000-0000-0000-0000000000b3', 'none@example.com', '{}'),
  ('bbbb0000-0000-0000-0000-0000000000b4', 'junk@example.com', '{"terms_accepted":"yes","marketing_consent":"1"}');

select pg_temp.eq((select terms_accepted_at is not null from profiles where email = 'both@example.com'), true, 'terms time recorded');
select pg_temp.eq((select terms_version from profiles where email = 'both@example.com'), 'v1', 'terms version recorded');
select pg_temp.eq((select marketing_consent from profiles where email = 'both@example.com'), true, 'marketing consent recorded');
select pg_temp.eq((select marketing_consent_at is not null from profiles where email = 'both@example.com'), true, 'marketing time recorded');
select pg_temp.eq((select marketing_consent from profiles where email = 'terms@example.com'), false, 'marketing is off unless ticked');
select pg_temp.eq((select marketing_consent_at from profiles where email = 'terms@example.com'), null, 'no marketing time without consent');
select pg_temp.eq((select terms_accepted_at from profiles where email = 'none@example.com'), null, 'no terms time without acceptance');
select pg_temp.eq((select marketing_consent from profiles where email = 'junk@example.com'), false, 'non-true values are ignored');
select pg_temp.eq((select terms_accepted_at from profiles where email = 'junk@example.com'), null, 'non-true terms ignored');

\echo 'ALL CONSENT DB TESTS PASSED'
