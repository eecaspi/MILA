import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { submitReport } from "./actions";

export const metadata: Metadata = {
  title: "דיווח על בעיה באתר",
  robots: { index: false },
};

const errors: Record<string, string> = {
  missing: "נא למלא איך לחזור אלייך (טלפון או אימייל) ולתאר מה קרה.",
  consent: "כדי שנוכל לחזור אלייך, צריך לאשר את השימוש בפרטים.",
  failed: "משהו השתבש ולא הצלחנו לשלוח. נסי שוב בעוד רגע.",
};

const input =
  "w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent";

export default async function ReportProblemPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; page?: string }>;
}) {
  const { sent, error, page } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <header>
        <p className="eyebrow">יצירת קשר</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">נתקלת בבעיה באתר?</h1>
        <p className="mt-2 text-ink-soft">ספרי לנו מה קרה ונטפל בזה, ונחזור אלייך אם צריך פרטים.</p>
      </header>

      {sent ? (
        <div className="space-y-4 rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <p className="font-display text-2xl font-bold text-ink">תודה, קיבלנו!</p>
          <p className="text-ink-soft">נבדוק ונטפל בהקדם.</p>
          <Link href="/" className="btn-secondary inline-flex px-6 py-2">
            חזרה לאתר
          </Link>
        </div>
      ) : (
        <form action={submitReport} className="space-y-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] md:p-6">
          {error && <Alert tone="error">{errors[error] ?? errors.failed}</Alert>}
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">מה קרה?</span>
            <textarea name="message" rows={5} required maxLength={1500} placeholder="למשל: לחצתי על קבלת קוד ולא קרה כלום" className={input} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">איך חוזרים אלייך? (טלפון או אימייל)</span>
            <input name="contact" required minLength={5} maxLength={120} dir="ltr" className={`${input} text-right`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">שם (לא חובה)</span>
            <input name="name" maxLength={80} autoComplete="name" className={input} />
          </label>
          <input type="hidden" name="page" value={page ?? ""} />
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
