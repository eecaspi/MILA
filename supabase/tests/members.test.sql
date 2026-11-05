-- Sign-up channel is copied from the sign-up form into the member's profile.

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
  ('aaaa0000-0000-0000-0000-0000000000a1', 'wa@example.com', '{"display_name":"דנה","community_channel":"whatsapp"}'),
  ('aaaa0000-0000-0000-0000-0000000000a2', 'em@example.com', '{"community_channel":"email"}'),
  ('aaaa0000-0000-0000-0000-0000000000a3', 'junk@example.com', '{"community_channel":"carrier-pigeon"}'),
  ('aaaa0000-0000-0000-0000-0000000000a4', 'none@example.com', '{}');

select pg_temp.eq((select community_channel from profiles where email = 'wa@example.com'), 'whatsapp', 'whatsapp choice is saved');
select pg_temp.eq((select community_channel from profiles where email = 'em@example.com'), 'email', 'email choice is saved');
select pg_temp.eq((select community_channel from profiles where email = 'junk@example.com'), null, 'unknown values are ignored');
select pg_temp.eq((select community_channel from profiles where email = 'none@example.com'), null, 'no choice stays empty');

\echo 'ALL MEMBER DB TESTS PASSED'
