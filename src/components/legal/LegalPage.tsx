import Link from "next/link";
import { siteConfig } from "@/config/site";

const { legal } = siteConfig;

/** Shared frame for the legal pages: title, update date, draft notice and readable text. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl text-ink md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">עודכן לאחרונה: {legal.lastUpdated}</p>

      {legal.draft && (
        <p
          role="note"
          className="mt-6 rounded-[var(--radius-card)] border border-accent/30 bg-accent-soft p-4 text-sm text-ink"
        >
          <strong>טיוטה.</strong> הנוסח הזה טרם עבר בדיקה של עורך דין, ופרטים שמסומנים בסוגריים
          מרובעים עוד יושלמו.
        </p>
      )}

      <div className="mt-8 space-y-8 leading-relaxed text-ink [&_a]:font-semibold [&_a]:text-accent [&_a:hover]:underline [&_h2]:mb-2 [&_h2]:text-xl [&_li]:ms-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
        {children}
      </div>

      <nav aria-label="עמודים משפטיים" className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 text-sm">
        <Link href="/terms">תנאי שימוש</Link>
        <Link href="/privacy">מדיניות פרטיות</Link>
        <Link href="/disclosure">גילוי נאות</Link>
        <Link href="/accessibility">הצהרת נגישות</Link>
      </nav>
    </article>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ContactEmail() {
  return (
    <a href={`mailto:${legal.contactEmail}`} className="ltr">
      {legal.contactEmail}
    </a>
  );
}
