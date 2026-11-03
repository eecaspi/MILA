/**
 * Hebrew labels and messages for the rewards UI. Pure functions, no I/O.
 */
import type {
  AwardResult,
  ConversionStatus,
  EarningFrequency,
  PointsTransactionRow,
  PointsTxSource,
  PointsTxStatus,
  PointsTxType,
} from "./types.ts";

export const txTypeLabel: Record<PointsTxType, string> = {
  earn: "צבירה",
  redeem: "מימוש",
  reversal: "ביטול",
  adjustment: "עדכון ידני",
  expiration: "פקיעה",
};

export const txSourceLabel: Record<PointsTxSource, string> = {
  purchase: "קנייה דרך MILA",
  activity: "פעילות בקהילה",
  admin: "צוות MILA",
  redemption: "מימוש הטבה",
  system: "מערכת",
};

export const txStatusLabel: Record<PointsTxStatus, string> = {
  pending: "בהמתנה לאישור",
  confirmed: "אושר",
  cancelled: "בוטל",
};

export const frequencyLabel: Record<EarningFrequency, string> = {
  once: "פעם אחת",
  daily: "פעם ביום",
  weekly: "פעם בשבוע",
  monthly: "פעם בחודש",
  unlimited: "ללא הגבלת תדירות",
};

export const conversionStatusLabel: Record<ConversionStatus, string> = {
  pending: "ממתינה לאימות",
  approved: "אושרה",
  cancelled: "בוטלה",
  refunded: "הוחזרה",
};

/** "+50" / "-20", with a Unicode minus so it reads correctly inside RTL text. */
export function formatPoints(amount: number): string {
  if (amount > 0) return `+${amount.toLocaleString("he-IL")}`;
  if (amount < 0) return `−${Math.abs(amount).toLocaleString("he-IL")}`;
  return "0";
}

/** One-line Hebrew description of a ledger row for the member's history list. */
export function describeTransaction(
  tx: Pick<PointsTransactionRow, "type" | "source" | "note">,
): string {
  if (tx.type === "reversal") return `ביטול: ${txSourceLabel[tx.source]}`;
  if (tx.type === "adjustment")
    return tx.note ? `עדכון מצוות MILA: ${tx.note}` : "עדכון מצוות MILA";
  return txSourceLabel[tx.source];
}

/** Message shown to a member after the server evaluated a reward claim. */
export function awardMessage(result: AwardResult): { tone: "success" | "info"; text: string } {
  switch (result.status) {
    case "awarded":
      return { tone: "success", text: `כל הכבוד! קיבלת ${result.points} נקודות 💜` };
    case "already_awarded":
      return { tone: "info", text: "כבר קיבלת נקודות על הפעולה הזו." };
    case "not_eligible":
      switch (result.reason) {
        case "program_disabled":
        case "rule_inactive":
          return { tone: "info", text: "הפרופיל נשמר. צבירת הנקודות תיפתח בקרוב." };
        case "profile_incomplete":
          return { tone: "info", text: "הפרופיל נשמר. כדי לקבל נקודות, צריך למלא שם ועיר." };
        case "outside_campaign_window":
          return { tone: "info", text: "המבצע הזה לא פעיל כרגע." };
        case "max_per_user_reached":
          return { tone: "info", text: "הגעת למספר הפעמים המרבי לפעולה הזו." };
      }
  }
}

/** Narrows an untyped RPC response to AwardResult, failing loudly on anything unexpected. */
export function parseAwardResult(value: unknown): AwardResult {
  if (typeof value === "object" && value !== null && "status" in value) {
    const status = (value as { status: unknown }).status;
    if (status === "awarded" || status === "already_awarded" || status === "not_eligible") {
      return value as AwardResult;
    }
  }
  throw new Error(`Unexpected award result: ${JSON.stringify(value)}`);
}

export function agorotToShekels(agorot: number): string {
  return (agorot / 100).toLocaleString("he-IL", { style: "currency", currency: "ILS" });
}
