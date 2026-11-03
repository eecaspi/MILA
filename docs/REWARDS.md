# MILA Rewards — architecture

Status: **foundation only.** The program ships switched off. No member earns
points until an admin enables the program and an earning rule at `/admin/rewards`.

## Principles

| Rule | How it is enforced |
| --- | --- |
| Never trust the client | Members have read-only access. All writes go through `SECURITY DEFINER` database functions that check conditions against stored data. |
| Auditable ledger | `points_transactions` is append-only (no deletes, only `pending → confirmed/cancelled`). Balances come from the `points_balances` view, never from an editable column. |
| No duplicates | Every row has a unique `idempotency_key` (`activity:<rule>:<user>:<period>`, `purchase:<conversion>:…`, `admin-adjust:<request>`, `reversal:<tx>`). Retries and double-submits are no-ops. |
| No negative balances | A trigger serializes writes per user and rejects any confirmed debit that would go below zero. **Exception (business decision, see below):** reversals of rewards the member already spent. |
| Clicks earn nothing | Points come only from `affiliate_conversions` reported by a verified network, and stay `pending` until the purchase is approved. |
| Cancelled purchases never pay out | Cancel/refund while pending → points cancelled. After approval → a reversal row. |
| Full audit trail | Every admin function writes `admin_audit_log` in the same transaction. The log is append-only. |
| No monetary value | Points have no ILS value in the schema. Purchase rules convert **commission** into points at a configurable rate per business. |

## Data model (migration `0002_rewards_foundation.sql`)

- `rewards_program` — single on/off switch.
- `earning_rules` — `kind` = `activity` (fixed points) or `purchase` (points per ₪1 of commission, optional per business).
  Supports frequency (`once/daily/weekly/monthly/unlimited`, Israel time), `max_per_user`, campaign window,
  declarative `eligibility` JSON, `is_active`, and `is_implemented`. A rule can't be activated unless server-side
  verification exists for it (`is_implemented`).
- `affiliate_conversions` — purchases reported by networks, unique per `(network, external_id)`.
- `points_transactions` — the ledger. Types: `earn`, `redeem`, `reversal`, `adjustment`, `expiration`.
  Sources: `purchase`, `activity`, `admin`, `redemption`, `system`. Statuses: `pending`, `confirmed`, `cancelled`.
- `points_balances` (view) — `available`, `pending`, `total_earned`, `total_redeemed`, `total_expired`.
  Invariant: `available = total_earned − total_redeemed − total_expired`.
- `admin_audit_log` — append-only.
- `notification_preferences` — per-channel opt-in (`email`, `whatsapp`, `sms`), all off by default.
- `profiles` — now with `email`, `city`, `updated_at`; auto-created on sign-up; members can edit their
  name and city but not their role or email.

## Database API

| Function | Caller | Purpose |
| --- | --- | --- |
| `claim_profile_completion()` | signed-in member | Awards the profile bonus if the stored profile meets the rule's `required_profile_fields`. |
| `record_conversion(...)` | service role (webhooks) | Upserts a conversion, validates status transitions, syncs points. |
| `admin_adjust_points(user, amount, reason, request_id)` | admin | Manual credit/debit with mandatory reason. |
| `admin_reverse_transaction(tx, reason)` | admin | Cancels a pending row or books a reversal. |
| `admin_set_rule_active(rule, active)` | admin | Toggle an implemented rule. |
| `admin_set_program_enabled(enabled)` | admin | Program switch. |
| `admin_set_conversion_status(conversion, status, reason)` | admin | Manual review of a reported purchase. |
| `admin_rewards_stats()` | admin | Dashboard numbers. |

HTTP: `POST /api/affiliate/conversions/[network]` — returns **501** until a network adapter is registered
(`src/lib/rewards/conversions.ts`).

## Seeded rules

| Key | Points | Status |
| --- | --- | --- |
| `profile_completed` | 50, once | implemented, **off** |
| `purchase_default` | 1 per ₪1 commission | not implemented (no network yet) |
| `survey_completed`, `challenge_completed`, `friend_referred`, `business_discovered`, `campaign_participation` | configurable | not implemented |

## Extension points (not built)

- **Redemption / marketplace** — add a `rewards` catalog (with `funding_business_id`, so a reward bought at
  Business A can be redeemed at Business B) and a `redeem_reward()` function that inserts a `redeem` row
  (source `redemption`). The non-negative trigger already protects it.
- **Membership tiers** — derive from `total_earned` (or a rolling window) in a view; no ledger change needed.
  Flag: `siteConfig.features.membershipTiers`.
- **Challenges / campaigns** — new `activity` rules plus a verifier per activity that calls `_award_activity()`
  and sets `is_implemented = true`.
- **Expiration** — a scheduled job inserting `expiration` rows.
- **Notifications / WhatsApp** — implement a `NotificationChannel` in `src/lib/notifications` that checks
  `notification_preferences` before sending. Do not assume WhatsApp groups support interactive features.
- **Games of chance** (raffles, prize wheels, surprise draws) — `siteConfig.features.gamesOfChance` must stay
  `false` until legal review.

## Decisions to confirm with the business

1. **Refund after points were spent.** Today the reversal is still recorded and the balance can go negative
   (a visible debt that blocks redemption). Alternative: absorb the loss. Needs a decision before redemption launches.
2. **Purchase rate.** The default rule is 1 point per ₪1 of commission. The real rate depends on the business model.
3. **Profile bonus.** 50 points for name + city. Change in `earning_rules` before enabling.
4. **Commission changes.** If a network changes the commission between "pending" and "approved",
   the final commission decides the points (the pending estimate is cancelled).

## Testing

- `npm run test` — unit tests (labels, messages, conversion validation, notifications).
- `npm run test:db` — runs all migrations on a throwaway local Postgres and executes
  `supabase/tests/rewards.test.sql` (security, idempotency, purchases, refunds, limits, audit).
- CI (`.github/workflows/ci.yml`) runs both plus typecheck, lint and build on every PR.
