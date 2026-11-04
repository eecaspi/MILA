import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Field, SubmitButton } from "@/components/ui/Field";
import { siteConfig } from "@/config/site";
import { authMessage } from "@/lib/auth/messages";
import { getSession, safeNextPath } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signIn, signUp } from "./actions";

export const metadata: Metadata = {
  title: "כניסה למועדון",
  robots: { index: false },
};

type SearchParams = Promise<{ mode?: string; error?: string; notice?: string; next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await getSession()) redirect(next);

  const signupOpen = siteConfig.features.memberSignup;
  const mode = signupOpen && params.mode === "signup" ? "signup" : "login";
  const error = authMessage(params.error);
  const notice = authMessage(params.notice);
  const disabled = !isSupabaseConfigured;

  const tab = (value: "login" | "signup", label: string) => (
    <Link
      href={`/login?mode=${value}&next=${encodeURIComponent(next)}`}
      aria-current={mode === value ? "page" : undefined}
      className={[
        "flex-1 rounded-full py-2 text-center text-sm font-semibold transition-colors",
        mode === value ? "bg-surface text-accent shadow-sm" : "text-ink-soft hover:text-accent",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <p className="eyebrow">{signupOpen ? "מועדון לייקי" : "כניסה לצוות לייקי"}</p>
        <h1 className="mt-2 text-3xl text-ink">
          {mode === "signup" ? "בואי להיות חברה שלנו" : "איזה כיף שחזרת!"}
        </h1>
        <p className="mt-2 text-ink-soft">
          {mode === "signup"
            ? "חשבון אחד להטבות, להמלצות ולמועדון לייקי. בלי עלות."
            : signupOpen
              ? "התחברי ואני אראה לך מה חדש."
              : "מועדון הלקוחות עדיין בעבודה. הכניסה כרגע לצוות בלבד."}
        </p>
      </div>

      <div className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
        {signupOpen && (
          <nav aria-label="סוג כניסה" className="flex gap-1 rounded-full bg-raised p-1">
            {tab("login", "כניסה")}
            {tab("signup", "הרשמה")}
          </nav>
        )}

        {disabled && <Alert tone="info">{authMessage("not_configured")}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <form action={mode === "signup" ? signUp : signIn} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          {mode === "signup" && (
            <Field
              id="display_name"
              label="שם פרטי"
              autoComplete="given-name"
              placeholder="איך לקרוא לך?"
              disabled={disabled}
            />
          )}
          <Field
            id="email"
            label="אימייל"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            disabled={disabled}
          />
          <Field
            id="password"
            label="סיסמה"
            type="password"
            dir="ltr"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            hint={mode === "signup" ? "לפחות 8 תווים" : undefined}
            required
            disabled={disabled}
          />
          <SubmitButton disabled={disabled}>
            {mode === "signup" ? "אני מצטרפת" : "כניסה"}
          </SubmitButton>
        </form>
      </div>

      {signupOpen && (
        <p className="mt-6 text-center text-xs text-ink-soft">
          ההצטרפות חינמית. לא נשלח לך הודעות בוואטסאפ או ב־SMS בלי שאישרת זאת.
        </p>
      )}
    </div>
  );
}
