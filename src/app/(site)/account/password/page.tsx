import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { authMessage } from "@/lib/auth/messages";
import { requireSession } from "@/lib/auth/session";
import { changePassword } from "./actions";

export const metadata: Metadata = {
  title: "שינוי סיסמה",
  robots: { index: false },
};

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function PasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession("/account/password");
  const { ok, error } = await searchParams;
  const isAdmin = session.profile.role === "admin";
  const message = authMessage(error);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link
        href={isAdmin ? "/admin" : "/account"}
        className="text-sm font-semibold text-accent hover:underline"
      >
        {isAdmin ? "→ חזרה לניהול" : "→ חזרה לאזור האישי"}
      </Link>
      <h1 className="mt-4 text-3xl text-ink">שינוי סיסמה</h1>
      <p className="mt-1 text-ink-soft">
        מחוברת בתור <span className="ltr">{session.email}</span>
      </p>

      <div className="mt-6 space-y-4">
        {ok && <Alert tone="success">הסיסמה שונתה. בפעם הבאה נכנסים עם הסיסמה החדשה.</Alert>}
        {message && <Alert tone="error">{message}</Alert>}

        <form
          action={changePassword}
          className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]"
        >
          <PasswordField
            id="current"
            label="הסיסמה הנוכחית"
            autoComplete="current-password"
            required
          />
          <PasswordField
            id="next"
            label="סיסמה חדשה"
            autoComplete="new-password"
            minLength={8}
            hint="לפחות 8 תווים"
            required
          />
          <PasswordField
            id="confirm"
            label="הסיסמה החדשה שוב"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <SubmitButton>שמירת הסיסמה החדשה</SubmitButton>
        </form>
      </div>
    </div>
  );
}
