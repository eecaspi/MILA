import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getSession } from "@/lib/auth/session";
import { CommunityInvite } from "@/components/home/CommunityInvite";

export const metadata: Metadata = {
  title: "החברות של ליקי",
  description: "קהילת הנשים של ליקי: הטבות חדשות והמלצות ישר לוואטסאפ.",
};

export default async function CommunityPage() {
  const session = await getSession();
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <header className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">הקהילה</p>
          <h1 className="mt-1 text-3xl text-ink md:text-5xl">החברות של ליקי</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            ליקי היא קודם כול חברה. הקהילה שלנו בוואטסאפ היא המקום לקבל הטבות חדשות והמלצות על עסקים
            טובים.
          </p>
        </div>
        <Logo variant="full" height={220} className="mx-auto" />
      </header>

      {!session && <CommunityInvite />}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
        <div>
          <h2 className="text-2xl text-ink">המלצות מהקהילה – בקרוב</h2>
          <p className="mt-1 text-ink-soft">
            בקרוב תוכלי לקרוא ולכתוב המלצות על עסקים ואנשי מקצוע.
          </p>
        </div>
        <Link href="/businesses" className="btn-secondary">
          בינתיים, לעסקים שלנו
        </Link>
      </section>
    </div>
  );
}
