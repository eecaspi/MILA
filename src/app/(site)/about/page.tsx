import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "קצת עלינו",
  description: "מי אנחנו, מה עומד מאחורי ליקי, ואיך מצטרפות לקבוצת הוואטסאפ.",
};

export default function AboutPage() {
  const { legal } = siteConfig;
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <header className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">קצת עלינו</p>
          <h1 className="mt-1 text-3xl text-ink md:text-5xl">{siteConfig.brand.slogan}</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            ליקי היא אתר שמרכז במקום אחד הטבות, מבצעים ועסקים מומלצים, וקבוצת וואטסאפ שבה מקבלים עדכונים
            והמלצות ישר לטלפון.
          </p>
        </div>
        <Logo variant="full" height={200} className="mx-auto" />
      </header>

      <section aria-labelledby="who" className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
        <h2 id="who" className="text-2xl text-ink">
          מי עומדת מאחורי האתר
        </h2>
        <p className="mt-3 text-ink-soft">
          האתר מופעל על ידי {legal.operatorName} (ח.פ. {legal.companyId}). אנחנו בונות את ליקי צעד אחרי
          צעד, כדי שיהיה קל למצוא הטבות טובות מעסקים שכדאי להכיר.
        </p>
        <p className="mt-3 text-ink-soft">
          ליקי עצמה, הדמות עם השקית האדומה שמלווה אותך באתר, היא דמות שנוצרה בעזרת בינה מלאכותית.
        </p>
      </section>

      <section aria-labelledby="how" className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
        <h2 id="how" className="text-2xl text-ink">
          איך זה עובד
        </h2>
        <ol className="mt-3 list-decimal space-y-2 ps-5 text-ink-soft">
          <li>נרשמות בחינם, בלי כרטיס אשראי.</li>
          <li>קודי הקופון של העסקים מופיעים רק לחברות רשומות.</li>
          <li>משתמשות בקוד ישירות מול העסק. אנחנו לא מוכרות את המוצרים.</li>
        </ol>
        <p className="mt-4 text-sm text-ink-soft">
          איך אנחנו פועלות מול העסקים, ומתי ייתכן שיש לנו עמלה, כתוב ב
          <Link href="/disclosure" className="font-semibold text-accent hover:underline">
            גילוי הנאות
          </Link>
          .
        </p>
      </section>

      <CommunityInvite />
    </div>
  );
}
