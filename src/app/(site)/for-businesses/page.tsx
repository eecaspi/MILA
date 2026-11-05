import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { submitInquiry } from "./actions";

export const metadata: Metadata = {
  title: "לבעלי עסקים",
  description: "בעלת עסק? השאירי פרטים ונחזור אלייך עם כל המידע על ההצטרפות לליקי.",
};

const errors: Record<string, string> = {
  missing: "נא למלא שם עסק, שם איש קשר וטלפון.",
  phone: "מספר הטלפון לא נראה תקין.",
  email: "כתובת האימייל לא נראית תקינה.",
  website: "כתובת האתר צריכה להתחיל ב־https://",
  consent: "כדי שנוכל לחזור אלייך, צריך לאשר את השימוש בפרטים.",
  failed: "משהו השתבש ולא הצלחנו לשלוח. נסי שוב בעוד רגע.",
};

const input =
  "w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent";

export default async function ForBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <header>
        <p className="eyebrow">לבעלי עסקים</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">רוצה שליקי תספר על העסק שלך?</h1>
        <p className="mt-2 text-ink-soft">
          השאירי פרטים ונחזור אלייך עם כל המידע: איך זה עובד, מה מתאים לעסק שלך, ואיך מצטרפים.
        </p>
      </header>

      {sent ? (
        <div className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <p className="font-display text-2xl font-bold text-ink">תודה, קיבלנו!</p>
          <p className="text-ink-soft">נחזור אלייך בהקדם עם הפרטים.</p>
          <Link href="/" className="btn-secondary inline-flex px-6 py-2">
            חזרה לאתר
          </Link>
        </div>
      ) : (
        <form action={submitInquiry} className="space-y-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] md:p-6">
          {error && <Alert tone="error">{errors[error] ?? errors.failed}</Alert>}
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">שם העסק</span>
            <input name="business" required maxLength={120} className={input} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">שם איש הקשר</span>
            <input name="name" required maxLength={80} autoComplete="name" className={input} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">טלפון (אפשר וואטסאפ)</span>
            <input name="phone" type="tel" required maxLength={30} autoComplete="tel" dir="ltr" className={`${input} text-right`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">אימייל (לא חובה)</span>
            <input name="email" type="email" maxLength={120} autoComplete="email" dir="ltr" className={`${input} text-right`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">אתר או אינסטגרם של העסק (לא חובה)</span>
            <input name="website" type="url" maxLength={200} placeholder="https://" dir="ltr" className={`${input} text-right`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">רוצה לספר לנו משהו? (לא חובה)</span>
            <textarea name="message" rows={4} maxLength={1000} className={input} />
          </label>
          <div aria-hidden className="absolute -start-[9999px]">
            <input name="website_url" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="consent" value="yes" required className="mt-1 size-4 accent-[var(--color-accent)]" />
            <span>
              אני מאשרת שתחזרו אליי בנוגע לפנייה, ושקראתי את{" "}
              <Link href="/privacy" className="font-semibold text-accent underline">
                מדיניות הפרטיות
              </Link>
              .
            </span>
          </label>
          <button type="submit" className="btn-primary w-full py-3">
            שליחה
          </button>
        </form>
      )}
    </div>
  );
}
