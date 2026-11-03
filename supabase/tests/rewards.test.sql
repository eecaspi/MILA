-- Rewards database tests. Run with: npm run test:db  (needs a local Postgres; see scripts/test-db.sh)
-- Runs against the Supabase stub + all migrations. Every block raises on failure.

\set ON_ERROR_STOP 1
\set QUIET 1

-- ---------- helpers ----------
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

create function pg_temp.balance(p_user uuid, col text) returns integer
language plpgsql as $$
declare v integer;
begin
  execute format('select %I from points_balances where user_id = $1', col) into v using p_user;
  return v;
end;
$$;

-- ---------- fixtures (as postgres) ----------
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '{"display_name":"מנהלת"}'),
  ('22222222-2222-2222-2222-222222222222', 'rivka@example.com', '{}'),
  ('33333333-3333-3333-3333-333333333333', 'sara@example.com', '{"display_name":"שרה"}');

select pg_temp.eq((select count(*)::int from profiles), 3, 'sign-up trigger creates a profile per user');
select pg_temp.eq((select email from profiles where id = '22222222-2222-2222-2222-222222222222'),
  'rivka@example.com', 'profile copies email');
update profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';

-- ===== member: rivka =====
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

select pg_temp.fails($$insert into points_transactions (user_id, type, source, status, amount, idempotency_key)
  values ('22222222-2222-2222-2222-222222222222', 'earn', 'activity', 'confirmed', 1000, 'x')$$,
  '42501', 'members cannot write to the ledger directly');
select pg_temp.fails($$update earning_rules set points = 9999$$, '42501', 'members cannot edit rules');
select pg_temp.fails($$select admin_set_program_enabled(true)$$, '42501', 'members cannot enable the program');
select pg_temp.fails($$select admin_adjust_points('22222222-2222-2222-2222-222222222222', 500, 'free points', gen_random_uuid())$$,
  '42501', 'members cannot adjust points');
select pg_temp.fails($$select record_conversion('net', 'o1', 'approved', 100000, now(), '22222222-2222-2222-2222-222222222222')$$,
  '42501', 'members cannot report purchases');
select pg_temp.fails($$update profiles set role = 'admin' where id = auth.uid()$$, '42501', 'members cannot promote themselves');

select pg_temp.eq(claim_profile_completion() ->> 'reason', 'program_disabled', 'no points while the program is off');

-- ===== admin turns the program on =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

select pg_temp.eq(admin_set_program_enabled(true) ->> 'status', 'updated', 'admin enables the program');
select pg_temp.fails($$select admin_set_rule_active((select id from earning_rules where key = 'survey_completed'), true)$$,
  '22023', 'unverifiable activities cannot be activated');
select pg_temp.eq(admin_set_rule_active((select id from earning_rules where key = 'profile_completed'), true) ->> 'status',
  'updated', 'admin activates profile completion');

-- ===== rivka completes her profile =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

select pg_temp.eq(claim_profile_completion() ->> 'reason', 'profile_incomplete', 'incomplete profile earns nothing');
update profiles set display_name = 'רבקה', city = 'בני ברק' where id = auth.uid();
select pg_temp.eq(claim_profile_completion() ->> 'status', 'awarded', 'complete profile is awarded');
select pg_temp.eq(claim_profile_completion() ->> 'status', 'already_awarded', 'second claim is idempotent');
select pg_temp.eq(pg_temp.balance(auth.uid(), 'available'), 50, 'available = 50 after profile bonus');
select pg_temp.eq((select count(*)::int from points_transactions), 1, 'member sees only her own transactions');
select pg_temp.eq((select count(*)::int from points_balances), 1, 'member sees only her own balance');

-- ===== admin adjustments and reversals =====
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

select pg_temp.eq(admin_adjust_points('22222222-2222-2222-2222-222222222222', 100, 'פיצוי על תקלה',
  'aaaaaaaa-0000-0000-0000-000000000001') ->> 'status', 'applied', 'admin adds 100 points');
select pg_temp.eq(admin_adjust_points('22222222-2222-2222-2222-222222222222', 100, 'פיצוי על תקלה',
  'aaaaaaaa-0000-0000-0000-000000000001') ->> 'status', 'already_applied', 'resubmitted adjustment is idempotent');
select pg_temp.eq(pg_temp.balance('22222222-2222-2222-2222-222222222222', 'available'), 150, 'available = 150');
select pg_temp.fails($$select admin_adjust_points('22222222-2222-2222-2222-222222222222', -1000, 'too much', gen_random_uuid())$$,
  '23514', 'adjustment cannot make the balance negative');
select pg_temp.fails($$select admin_adjust_points('22222222-2222-2222-2222-222222222222', 10, '', gen_random_uuid())$$,
  '22023', 'adjustment requires a reason');

select pg_temp.eq(admin_reverse_transaction(
  (select id from points_transactions where idempotency_key = 'admin-adjust:aaaaaaaa-0000-0000-0000-000000000001'),
  'נוסף בטעות') ->> 'status', 'reversed', 'admin reverses the adjustment');
select pg_temp.eq(admin_reverse_transaction(
  (select id from points_transactions where idempotency_key = 'admin-adjust:aaaaaaaa-0000-0000-0000-000000000001'),
  'נוסף בטעות') ->> 'status', 'already_reversed', 'reversing twice is idempotent');
select pg_temp.fails($$select admin_reverse_transaction(
  (select id from points_transactions where type = 'reversal' limit 1), 'undo undo')$$,
  '22023', 'a reversal cannot be reversed');
select pg_temp.eq(pg_temp.balance('22222222-2222-2222-2222-222222222222', 'available'), 50, 'available back to 50');
select pg_temp.eq((select count(*)::int from admin_audit_log where action like 'points.%'), 2,
  'adjustment and reversal are in the audit log');

-- ===== ledger is append-only =====
reset role;
select pg_temp.fails($$update points_transactions set amount = 5000 where type = 'earn'$$,
  '42501', 'amounts can never be edited');
select pg_temp.fails($$delete from points_transactions$$, '42501', 'ledger rows can never be deleted');
select pg_temp.fails($$delete from admin_audit_log$$, '42501', 'audit log rows can never be deleted');

-- ===== purchases (as the affiliate integration, i.e. service role) =====
update earning_rules set is_implemented = true, is_active = true where key = 'purchase_default';
insert into businesses (id, slug, name, category_slug, is_real_business, status)
  values ('bbbbbbbb-0000-0000-0000-000000000001', 'test-shop', 'חנות בדיקה', 'fashion', false, 'demo');
insert into earning_rules (key, kind, title, points_per_commission_shekel, business_id, is_implemented, is_active)
  values ('purchase_test_shop', 'purchase', 'חנות בדיקה', 2, 'bbbbbbbb-0000-0000-0000-000000000001', true, true);

set role service_role;

-- default rate: 1 point per 1 ILS of commission
select pg_temp.eq(record_conversion('net', 'order-1', 'pending', 2500, now(),
  '33333333-3333-3333-3333-333333333333') ->> 'points_status', 'pending', 'reported purchase creates pending points');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'pending'), 25, 'pending = 25');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'available'), 0, 'pending points are not spendable');
select pg_temp.eq(record_conversion('net', 'order-1', 'pending', 2500, now()) ->> 'points_status', 'pending',
  'duplicate webhook is harmless');
select pg_temp.eq((select count(*)::int from points_transactions where conversion_id is not null), 1,
  'duplicate webhook did not add a second reward');
select pg_temp.eq(record_conversion('net', 'order-1', 'approved', 2500, now()) ->> 'points_status', 'confirmed',
  'approved purchase confirms points');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'available'), 25, 'available = 25 after approval');
select pg_temp.eq(record_conversion('net', 'order-1', 'refunded', 2500, now()) ->> 'points_status', 'reversed',
  'refund after approval reverses points');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'available'), 0, 'available = 0 after refund');
select pg_temp.fails($$select record_conversion('net', 'order-1', 'approved', 2500, now())$$, '22023',
  'a refunded purchase cannot be re-approved');

select record_conversion('net', 'order-2', 'pending', 4000, now(), '33333333-3333-3333-3333-333333333333');
select pg_temp.eq(record_conversion('net', 'order-2', 'cancelled', 4000, now()) ->> 'points_status', 'cancelled',
  'cancelled purchase cancels pending points');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'pending'), 0, 'no pending points left');

select record_conversion('net', 'order-3', 'pending', 1000, now(), '33333333-3333-3333-3333-333333333333');
select record_conversion('net', 'order-3', 'approved', 1800, now());
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'available'), 18,
  'final commission decides the points');

select pg_temp.eq((record_conversion('net', 'order-4', 'approved', 1000, now(),
  '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-0000-0000-0000-000000000001') ->> 'points_status'), 'confirmed',
  'business-specific purchase');
select pg_temp.eq(pg_temp.balance('33333333-3333-3333-3333-333333333333', 'available'), 38,
  'business-specific rate (2/ILS) beats the default');

select pg_temp.eq(record_conversion('net', 'order-5', 'approved', 1000, now()) ->> 'points_status', 'no_user',
  'purchase without a known member awards nothing');

-- refund after the member already spent the points: the reversal is still recorded (explicit deficit)
select record_conversion('net', 'order-6', 'approved', 5000, now(), '22222222-2222-2222-2222-222222222222');
reset role;
insert into points_transactions (user_id, type, source, status, amount, idempotency_key)
  values ('22222222-2222-2222-2222-222222222222', 'redeem', 'redemption', 'confirmed', -100, 'test-redeem-1');
set role service_role;
select pg_temp.eq(record_conversion('net', 'order-6', 'refunded', 5000, now()) ->> 'points_status', 'reversed',
  'refund after spending still reverses');
select pg_temp.eq(pg_temp.balance('22222222-2222-2222-2222-222222222222', 'available'), -50,
  'refund after spending leaves a visible deficit');

-- admin review of a pending purchase
select record_conversion('net', 'order-7', 'pending', 3000, now(), '33333333-3333-3333-3333-333333333333');
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select pg_temp.eq(admin_set_conversion_status(
  (select id from affiliate_conversions where external_id = 'order-7'), 'approved', 'אושר מול הרשת') ->> 'points_status',
  'confirmed', 'admin approves a pending purchase');
select pg_temp.eq((select count(*)::int from admin_audit_log where action = 'conversion.set_status'), 1,
  'purchase review is in the audit log');
select pg_temp.eq((admin_rewards_stats() ->> 'members')::int, 3, 'admin stats work');

reset role;

-- ===== frequency limits, caps and campaign windows (internal function, as postgres) =====
update earning_rules set is_implemented = true, is_active = true, max_per_user = 2 where key = 'business_discovered';
select pg_temp.eq(_award_activity('22222222-2222-2222-2222-222222222222', 'business_discovered', null,
  '2026-11-01 10:00+02') ->> 'status', 'awarded', 'daily activity awarded on day 1');
select pg_temp.eq(_award_activity('22222222-2222-2222-2222-222222222222', 'business_discovered', null,
  '2026-11-01 20:00+02') ->> 'status', 'already_awarded', 'second time the same day is not awarded');
select pg_temp.eq(_award_activity('22222222-2222-2222-2222-222222222222', 'business_discovered', null,
  '2026-11-02 09:00+02') ->> 'status', 'awarded', 'daily activity awarded again next day');
select pg_temp.eq(_award_activity('22222222-2222-2222-2222-222222222222', 'business_discovered', null,
  '2026-11-03 09:00+02') ->> 'reason', 'max_per_user_reached', 'max per user is enforced');

update earning_rules set is_implemented = true, is_active = true,
  starts_at = '2026-12-01', ends_at = '2026-12-31' where key = 'campaign_participation';
select pg_temp.eq(_award_activity('22222222-2222-2222-2222-222222222222', 'campaign_participation', null,
  '2026-11-15') ->> 'reason', 'outside_campaign_window', 'campaign dates are enforced');

-- ===== program switch off stops new awards =====
update rewards_program set is_enabled = false;
select pg_temp.eq(_award_activity('33333333-3333-3333-3333-333333333333', 'profile_completed') ->> 'reason',
  'program_disabled', 'disabling the program stops new awards');

-- ===== balance identity holds for everyone =====
select pg_temp.eq((select count(*)::int from points_balances
  where available <> total_earned - total_redeemed - total_expired), 0, 'available = earned - redeemed - expired');

\echo 'ALL REWARDS DB TESTS PASSED'
