import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getSession } from "@/lib/auth/session";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "קצת עלינו",
  description: "מי אנחנו, מה עומד מאחורי ליקי, ואיך מצטרפות לקבוצת הוואטסאפ.",
};

export default async function AboutPage() {
  const session = await getSession();
  const { legal } = siteConfig;
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <header className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">קצת עלינו</p>
          <h1 className="mt-1 text-3xl text-ink md:text-5xl">{siteConfig.brand.slogan}</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            ליקי היא פלטפורמה דיגיטלית למבצעים והטבות, הפונה בעיקר לנשים בציבור החרדי והדתי ופתוחה לכולן.
          </p>
        </div>
        <Logo variant="full" height={200} className="mx-auto" />
      </header>

      <section aria-labelledby="who" className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
        <h2 id="who" className="text-2xl text-ink">
          נעים להכיר, ליקי
        </h2>
        <p className="mt-3 text-ink-soft">
          באמצעות מערך הפצה בוואטסאפ, בסטטוסים, במייל ובאתר ייעודי, ליקי מרכזת הטבות ממותגים ועסקים
          נבחרים ומנגישה אותן לקהל צרכני ממוקד.
        </p>
        <h2 id="who-liky" className="mt-8 text-2xl text-ink">
          ומי זאת ליקי?
        </h2>
        <p className="mt-3 text-ink-soft">
          ליקי היא הדמות שמלווה את הפלטפורמה ומעניקה לה זהות אישית, נגישה ומזוהה. הבחירה בדמות
          וירטואלית שנוצרה באמצעות AI מאפשרת ליצור פרזנטורית קבועה, תוך שמירה על שפה חזותית צנועה
          ומותאמת לערכי הקהל החרדי והדתי.
        </p>
        <p className="mt-3 text-ink-soft">
          כך נוצר שילוב בין חדשנות טכנולוגית, חוויית צרכנות עדכנית ותקשורת אישית בגובה העיניים.
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          מאחורינו עומדת {legal.operatorName} (ח.פ. {legal.companyId}).
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

      {!session && <CommunityInvite />}
    </div>
  );
}
