import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { authMessage } from "@/lib/auth/messages";
import { requireSession } from "@/lib/auth/session";
import { resetPassword } from "./actions";

export const metadata: Metadata = {
  title: "בחירת סיסמה חדשה",
  robots: { index: false },
};

type SearchParams = Promise<{ error?: string }>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  await requireSession("/login/forgot");
  const message = authMessage((await searchParams).error);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl text-ink">בחירת סיסמה חדשה</h1>
      <p className="mt-1 text-ink-soft">כותבות סיסמה חדשה, ומיד נכנסות איתה לחשבון.</p>
      <div className="mt-6 space-y-4">
        {message && <Alert tone="error">{message}</Alert>}
        <form
          action={resetPassword}
          className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]"
        >
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
          <SubmitButton>שמירת הסיסמה</SubmitButton>
        </form>
      </div>
    </div>
  );
}
