import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Field, SubmitButton } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
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
      <div className={mode === "login" ? "flex items-end gap-2" : "mb-8 text-center"}>
       <div className={mode === "login" ? "min-w-0 flex-1 self-center pb-6 text-start" : ""}>
        <p className="eyebrow">{signupOpen ? "מועדון ליקי" : "כניסה לצוות ליקי"}</p>
        <h1 className="mt-2 text-3xl text-ink">
          {mode === "signup" ? "בואי להיות חברה שלנו" : "איזה כיף שחזרת!"}
        </h1>
        <p className="mt-2 text-ink-soft">
          {mode === "signup"
            ? "דקה אחת, בלי עלות. אחרי ההרשמה קודי הקופון של העסקים מופיעים לך באתר."
            : signupOpen
              ? "התחברי ואני אראה לך מה חדש."
              : "מועדון הלקוחות עדיין בעבודה. הכניסה כרגע לצוות בלבד."}
        </p>
       </div>
        {mode === "login" && (
          <Image
            src="/brand/liky-boxes-stack.webp"
            alt="ליקי עם ערימת קופסאות"
            width={474}
            height={900}
            priority
            className="pointer-events-none -mb-px h-44 w-auto shrink-0 self-end"
          />
        )}
      </div>

      {mode === "signup" && (
        <ol className="mb-2 flex justify-center gap-4 text-center text-xs text-ink-soft">
          {["נרשמות", "מצטרפות לקבוצה (אם בחרת וואטסאפ)", "הקודים מופיעים באתר"].map((t, i) => (
            <li key={t} className="flex flex-1 flex-col items-center gap-1">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      )}

      <div
        className={`relative space-y-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] ${mode === "signup" ? "mt-28 pt-20" : ""}`}
      >
        {mode === "signup" && (
          <Image
            src="/brand/liky-sit.webp"
            alt="ליקי יושבת על הכרטיס"
            width={506}
            height={840}
            priority
            className="pointer-events-none absolute bottom-full left-3 z-10 mb-0! h-40 w-auto translate-y-[41%] sm:left-6"
          />
        )}
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
          <PasswordField
            id="password"
            label="סיסמה"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            hint={mode === "signup" ? "לפחות 8 תווים" : undefined}
            required
            disabled={disabled}
          />
          {mode === "signup" && (
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-semibold text-ink">איך נשארות בקשר?</legend>
              {(
                [
                  ["whatsapp", "קבוצת הוואטסאפ של ליקי", "הטבות חדשות ישר לטלפון"],
                  ["email", "אימייל", "למי שאין וואטסאפ. נוסיף אותך לרשימת העדכונים"],
                ] as const
              ).map(([value, title, hint]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft/60"
                >
                  <input
                    type="radio"
                    name="channel"
                    value={value}
                    required
                    disabled={disabled}
                    className="mt-1 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-semibold text-ink">{title}</span>
                    <span className="block text-xs text-ink-soft">{hint}</span>
                  </span>
                </label>
              ))}
              {siteConfig.community.whatsappUrl && (
                <a
                  href={siteConfig.community.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm font-semibold text-accent hover:underline"
                >
                  רוצה להיכנס לקבוצה כבר עכשיו? פתחי בוואטסאפ ←
                </a>
              )}
            </fieldset>
          )}
          {mode === "signup" && (
            <div className="space-y-2 text-sm text-ink">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="terms"
                  value="yes"
                  required
                  disabled={disabled}
                  className="mt-1 accent-[var(--color-accent)]"
                />
                <span>
                  קראתי ואני מסכימה ל
                  <Link href="/terms" target="_blank" className="font-semibold text-accent hover:underline">
                    תנאי השימוש
                  </Link>{" "}
                  ול
                  <Link href="/privacy" target="_blank" className="font-semibold text-accent hover:underline">
                    מדיניות הפרטיות
                  </Link>
                  .
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="marketing"
                  value="yes"
                  disabled={disabled}
                  className="mt-1 accent-[var(--color-accent)]"
                />
                <span>
                  אני מאשרת לקבל עדכונים והטבות מליקי באימייל. אפשר להסיר בכל עת.
                  <span className="block text-xs text-ink-soft">
                    (נדרש למי שבחרה ברשימת העדכונים באימייל)
                  </span>
                </span>
              </label>
            </div>
          )}
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
