import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Field, SubmitButton } from "@/components/ui/Field";
import { requireSession } from "@/lib/auth/session";
import { awardMessage } from "@/lib/rewards/format";
import type { AwardResult, NotEligibleReason } from "@/lib/rewards/types";
import { updateProfile } from "./actions";

export const metadata: Metadata = {
  title: "הפרופיל שלי",
  robots: { index: false },
};

const reasons: NotEligibleReason[] = [
  "program_disabled",
  "rule_inactive",
  "outside_campaign_window",
  "max_per_user_reached",
  "profile_incomplete",
];

/** Rebuilds the message from the URL. Only the status/reason is in the URL — never points. */
function resultFromParam(value: string | undefined): AwardResult | null {
  if (value === "already_awarded")
    return { status: "already_awarded", transaction_id: "", points: 0 };
  if (value && reasons.includes(value as NotEligibleReason)) {
    return { status: "not_eligible", reason: value as NotEligibleReason };
  }
  return null;
}

type SearchParams = Promise<{ result?: string; error?: string; notice?: string }>;

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession("/account/profile");
  const params = await searchParams;
  const result = resultFromParam(params.result);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/account" className="text-sm font-semibold text-accent hover:underline">
        → חזרה לאזור האישי
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">הפרופיל שלי</h1>
      <p className="mt-1 text-ink-soft">הפרטים עוזרים לנו להתאים לך עסקים והטבות באזור שלך.</p>

      <div className="mt-6 space-y-4">
        {params.result === "awarded" && (
          <Alert tone="success">כל הכבוד! קיבלת נקודות על השלמת הפרופיל 💜</Alert>
        )}
        {result && <Alert tone={awardMessage(result).tone}>{awardMessage(result).text}</Alert>}
        {params.notice === "saved" && <Alert tone="success">הפרופיל נשמר.</Alert>}
        {params.error && <Alert tone="error">לא הצלחנו לשמור. נסי שוב בעוד רגע.</Alert>}

        <form
          action={updateProfile}
          className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6"
        >
          <Field
            id="display_name"
            label="שם פרטי"
            autoComplete="given-name"
            maxLength={60}
            defaultValue={session.profile.display_name ?? ""}
          />
          <Field
            id="city"
            label="עיר מגורים"
            autoComplete="address-level2"
            maxLength={60}
            placeholder="לדוגמה: בני ברק"
            defaultValue={session.profile.city ?? ""}
          />
          <Field
            id="email"
            label="אימייל"
            type="email"
            dir="ltr"
            value={session.email ?? ""}
            disabled
            readOnly
          />
          <SubmitButton>שמירה</SubmitButton>
        </form>
      </div>
    </div>
  );
}
