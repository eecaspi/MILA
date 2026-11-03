/**
 * MILA Rewards domain types. The database (supabase/migrations/0002_rewards_foundation.sql)
 * is the source of truth and enforces every rule; these types describe what the app reads.
 */

export type PointsTxType = "earn" | "redeem" | "reversal" | "adjustment" | "expiration";
export type PointsTxSource = "purchase" | "activity" | "admin" | "redemption" | "system";
export type PointsTxStatus = "pending" | "confirmed" | "cancelled";
export type EarningRuleKind = "purchase" | "activity";
export type EarningFrequency = "once" | "daily" | "weekly" | "monthly" | "unlimited";
export type ConversionStatus = "pending" | "approved" | "cancelled" | "refunded";

/** Row shape of points_transactions (snake_case, as returned by Supabase). */
export interface PointsTransactionRow {
  id: string;
  user_id: string;
  type: PointsTxType;
  source: PointsTxSource;
  status: PointsTxStatus;
  amount: number;
  rule_id: string | null;
  conversion_id: string | null;
  reverses_transaction_id: string | null;
  note: string | null;
  created_at: string;
}

/** Row shape of the points_balances view. */
export interface PointsBalanceRow {
  user_id: string;
  available: number;
  pending: number;
  total_earned: number;
  total_redeemed: number;
  total_expired: number;
}

export interface EarningRuleRow {
  id: string;
  key: string;
  kind: EarningRuleKind;
  title: string;
  description: string;
  points: number | null;
  points_per_commission_shekel: number | null;
  business_id: string | null;
  frequency: EarningFrequency;
  max_per_user: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_implemented: boolean;
}

export interface AffiliateConversionRow {
  id: string;
  network: string;
  external_id: string;
  user_id: string | null;
  business_id: string | null;
  commission_agorot: number;
  order_amount_agorot: number | null;
  status: ConversionStatus;
  occurred_at: string;
}

export interface AuditLogRow {
  id: number;
  actor_id: string | null;
  action: string;
  target_user_id: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/** Result returned by claim_profile_completion() / _award_activity(). */
export type AwardResult =
  | { status: "awarded"; transaction_id: string; points: number }
  | { status: "already_awarded"; transaction_id: string; points: number }
  | { status: "not_eligible"; reason: NotEligibleReason; field?: string };

export type NotEligibleReason =
  | "program_disabled"
  | "rule_inactive"
  | "outside_campaign_window"
  | "max_per_user_reached"
  | "profile_incomplete";

export interface RewardsStats {
  members: number;
  members_with_points: number;
  points_available: number;
  points_pending: number;
  points_earned_30d: number;
  pending_conversions: number;
  program_enabled: boolean;
}

export const EMPTY_BALANCE: Omit<PointsBalanceRow, "user_id"> = {
  available: 0,
  pending: 0,
  total_earned: 0,
  total_redeemed: 0,
  total_expired: 0,
};
