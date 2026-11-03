import { Alert } from "@/components/ui/Alert";

const errors: Record<string, string> = {
  insufficient: "הפעולה תגרום ליתרה שלילית, ולכן לא בוצעה.",
  reason_required: "יש לכתוב סיבה (לפחות 3 תווים). הסיבה נשמרת ביומן הפעולות.",
  not_implemented: "עדיין אין אימות לפעילות הזו בצד השרת, ולכן אי אפשר להפעיל אותה.",
  not_reversible: "אי אפשר לבטל את התנועה הזו.",
  invalid_transition: "אי אפשר לשנות את סטטוס הקנייה למצב הזה.",
  invalid_amount: "כמות הנקודות צריכה להיות מספר שלם שונה מאפס.",
  failed: "הפעולה נכשלה. נסי שוב.",
};

export function ActionResult({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <Alert tone="error">{errors[error] ?? errors.failed}</Alert>;
  if (ok) return <Alert tone="success">הפעולה בוצעה ונרשמה ביומן.</Alert>;
  return null;
}
