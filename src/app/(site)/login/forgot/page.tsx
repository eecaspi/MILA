import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Field, SubmitButton } from "@/components/ui/Field";
import { authMessage } from "@/lib/auth/messages";
import { requestReset } from "./actions";

export const metadata: Metadata = {
  title: "שכחתי סיסמה",
  robots: { index: false },
};

type SearchParams = Promise<{ sent?: string; error?: string }>;

export default async function ForgotPage({ searchParams }: { searchParams: SearchParams }) {
  const { sent, error } = await searchParams;
  const message = authMessage(error);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/login" className="text-sm font-semibold text-accent hover:underline">
        → חזרה להתחברות
      </Link>
      <h1 className="mt-4 text-3xl text-ink">שכחת סיסמה?</h1>
      <p className="mt-1 text-ink-soft">
        כותבות את האימייל איתו נרשמת, ואנחנו שולחות קישור לבחירת סיסמה חדשה.
      </p>

      <div className="mt-6 space-y-4">
        {sent && <Alert tone="success">{authMessage("reset_sent")}</Alert>}
        {message && <Alert tone="error">{message}</Alert>}
        <form
          action={requestReset}
          className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]"
        >
          <Field
            id="email"
            label="אימייל"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            dir="ltr"
          />
          <SubmitButton>שלחי לי קישור</SubmitButton>
        </form>
      </div>
    </div>
  );
}
