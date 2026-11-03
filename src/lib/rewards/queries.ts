import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_BALANCE,
  type EarningRuleRow,
  type PointsBalanceRow,
  type PointsTransactionRow,
} from "./types";

type Client = Awaited<ReturnType<typeof createClient>>;

const TX_COLUMNS =
  "id, user_id, type, source, status, amount, rule_id, conversion_id, reverses_transaction_id, note, created_at";

export interface MemberRewards {
  programEnabled: boolean;
  balance: Omit<PointsBalanceRow, "user_id">;
  transactions: PointsTransactionRow[];
  activeRules: EarningRuleRow[];
}

/** Everything the member's rewards dashboard shows. RLS limits every query to her own rows. */
export async function getMemberRewards(supabase: Client, userId: string): Promise<MemberRewards> {
  const [program, balance, transactions, rules] = await Promise.all([
    supabase.from("rewards_program").select("is_enabled").maybeSingle(),
    supabase.from("points_balances").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("points_transactions")
      .select(TX_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("earning_rules").select("*").order("points", { ascending: false }),
  ]);

  return {
    programEnabled: Boolean((program.data as { is_enabled?: boolean } | null)?.is_enabled),
    balance: (balance.data as PointsBalanceRow | null) ?? EMPTY_BALANCE,
    transactions: (transactions.data ?? []) as PointsTransactionRow[],
    activeRules: (rules.data ?? []) as EarningRuleRow[],
  };
}

export { TX_COLUMNS };
