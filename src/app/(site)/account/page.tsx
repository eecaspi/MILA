import type { Metadata } from "next";
import Link from "next/link";
import { PointsSummary } from "@/components/rewards/PointsSummary";
import { TransactionList } from "@/components/rewards/TransactionList";
import { Alert } from "@/components/ui/Alert";
import { toneClasses } from "@/components/ui/tones";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getMemberRewards } from "@/lib/rewards/queries";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

export const metadata: Metadata = {
  title: "האזור האישי",
  robots: { index: false },
};

const ways = [
  {
    icon: "🛍️",
    title: "קונות דרך ליקי",
    text: "נקודות על קניות מאומתות דרך הקישורים שלנו.",
    tone: "rose" as const,
  },
  {
    icon: "💜",
    title: "משתתפות בפעילויות הקהילה",
    text: "השלמת פרופיל, סקרים ואתגרים.",
    tone: "lilac" as const,
  },
  {
    icon: "🎁",
    title: "צוברות נקודות ופותחות הטבות",
    text: "חנות ההטבות של ליקי בדרך.",
    tone: "mint" as const,
  },
];

type SearchParams = Promise<{ notice?: string }>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession("/account");
  const { notice } = await searchParams;
  const supabase = await createClient();
  const rewards = await getMemberRewards(supabase, session.userId);
  const { data: myBusinesses } = await supabase.rpc("my_businesses");
  const hasBusiness = ((myBusinesses ?? []) as unknown[]).length > 0;
  const name = session.profile.display_name;
  const profileComplete = Boolean(session.profile.display_name && session.profile.city);
  const profileRule = rewards.activeRules.find((r) => r.key === "profile_completed");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">מועדון ליקי</p>
          <h1 className="mt-1 text-3xl text-ink">
            שלום{name ? ` ${name}` : ""}, ברוכה הבאה למועדון!
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            חברה במועדון מאז {formatDate(session.profile.created_at)}
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm font-semibold text-ink-soft hover:text-accent">
            התנתקות
          </button>
        </form>
      </header>

      {notice === "profile_saved" && <Alert tone="success">הפרופיל עודכן.</Alert>}

      {hasBusiness && (
        <Link
          href="/business"
          className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 hover:border-accent"
        >
          <div>
            <p className="font-bold text-ink">העסק שלי</p>
            <p className="text-sm text-ink-soft">צפיות, לחיצות וקודים של ההטבות שלך.</p>
          </div>
          <span aria-hidden className="text-xl text-accent">
            ←
          </span>
        </Link>
      )}

      <PointsSummary balance={rewards.balance} programEnabled={rewards.programEnabled} />

      {!profileComplete && (
        <Link
          href="/account/profile"
          className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-accent/40 bg-accent-soft p-5 transition-colors hover:border-accent"
        >
          <div>
            <p className="font-bold text-ink">השלימי את הפרופיל שלך</p>
            <p className="text-sm text-ink-soft">
              {rewards.programEnabled && profileRule?.points
                ? `ותקבלי ${profileRule.points} נקודות מתנה.`
                : "כדי שנוכל להתאים לך הטבות."}
            </p>
          </div>
          <span aria-hidden className="text-xl text-accent">
            ←
          </span>
        </Link>
      )}

      <section aria-labelledby="how" className="space-y-4">
        <h2 id="how" className="text-xl text-ink">
          איך צוברים נקודות?
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ways.map((w) => (
            <li key={w.title} className={`rounded-[var(--radius-card)] p-5 ${toneClasses[w.tone]}`}>
              <span aria-hidden className="text-2xl">
                {w.icon}
              </span>
              <p className="mt-2 font-display text-lg font-bold">{w.title}</p>
              <p className="mt-1 text-sm font-medium opacity-80">{w.text}</p>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl border border-dashed border-accent/30 bg-accent-soft px-4 py-3 text-center text-sm font-semibold text-accent">
          בקרוב: חנות ההטבות של ליקי
        </p>
      </section>

      <section aria-labelledby="history" className="rounded-[var(--radius-card)] bg-surface p-5">
        <h2 id="history" className="text-lg text-ink">
          הפעילות שלי
        </h2>
        <TransactionList transactions={rewards.transactions} />
        <p className="border-t border-line pt-3 text-xs text-ink-soft">
          הצטרפת למועדון ב־{formatDate(session.profile.created_at)}
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-5">
        <div>
          <p className="font-semibold text-ink">הפרטים שלי</p>
          <p className="text-sm text-ink-soft">
            {session.email}
            {session.profile.city ? ` · ${session.profile.city}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account/profile"
            className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
          >
            עריכת פרופיל
          </Link>
          <Link
            href="/account/password"
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-accent hover:text-accent"
          >
            שינוי סיסמה
          </Link>
        </div>
      </section>
    </div>
  );
}
