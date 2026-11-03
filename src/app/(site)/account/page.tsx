import type { Metadata } from "next";
import Link from "next/link";
import { PointsSummary } from "@/components/rewards/PointsSummary";
import { TransactionList } from "@/components/rewards/TransactionList";
import { Alert } from "@/components/ui/Alert";
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
  { icon: "🛍️", title: "קונות דרך MILA", text: "נקודות על קניות מאומתות דרך הקישורים שלנו." },
  { icon: "💜", title: "משתתפות בפעילויות הקהילה", text: "השלמת פרופיל, סקרים ואתגרים." },
  { icon: "🎁", title: "צוברות נקודות ופותחות הטבות", text: "חנות ההטבות של MILA בדרך." },
];

type SearchParams = Promise<{ notice?: string }>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession("/account");
  const { notice } = await searchParams;
  const supabase = await createClient();
  const rewards = await getMemberRewards(supabase, session.userId);
  const name = session.profile.display_name;
  const profileComplete = Boolean(session.profile.display_name && session.profile.city);
  const profileRule = rewards.activeRules.find((r) => r.key === "profile_completed");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-gold">MILA CLUB 💜</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">
            שלום{name ? ` ${name}` : ""}, ברוכה הבאה למועדון!
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            חברה במועדון מאז {formatDate(session.profile.created_at)}
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm font-semibold text-ink-soft hover:text-plum">
            התנתקות
          </button>
        </form>
      </header>

      {notice === "profile_saved" && <Alert tone="success">הפרופיל עודכן.</Alert>}

      <PointsSummary balance={rewards.balance} programEnabled={rewards.programEnabled} />

      {!profileComplete && (
        <Link
          href="/account/profile"
          className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-gold/40 bg-gold-soft p-5 transition-colors hover:border-gold"
        >
          <div>
            <p className="font-bold text-ink">השלימי את הפרופיל שלך</p>
            <p className="text-sm text-ink-soft">
              {rewards.programEnabled && profileRule?.points
                ? `ותקבלי ${profileRule.points} נקודות מתנה.`
                : "כדי שנוכל להתאים לך הטבות."}
            </p>
          </div>
          <span aria-hidden className="text-xl text-gold">
            ←
          </span>
        </Link>
      )}

      <section aria-labelledby="how" className="space-y-4">
        <h2 id="how" className="text-xl font-bold text-ink">
          איך צוברים נקודות?
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ways.map((w) => (
            <li key={w.title} className="rounded-2xl border border-line bg-paper p-4">
              <span aria-hidden className="text-2xl">
                {w.icon}
              </span>
              <p className="mt-2 font-semibold text-ink">{w.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{w.text}</p>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl border border-dashed border-plum/30 bg-plum-soft px-4 py-3 text-center text-sm font-semibold text-plum">
          בקרוב: חנות ההטבות של MILA
        </p>
      </section>

      <section
        aria-labelledby="history"
        className="rounded-[var(--radius-card)] border border-line bg-paper p-5"
      >
        <h2 id="history" className="text-lg font-bold text-ink">
          הפעילות שלי
        </h2>
        <TransactionList transactions={rewards.transactions} />
        <p className="border-t border-line pt-3 text-xs text-ink-soft">
          הצטרפת למועדון ב־{formatDate(session.profile.created_at)}
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
        <div>
          <p className="font-semibold text-ink">הפרטים שלי</p>
          <p className="text-sm text-ink-soft">
            {session.email}
            {session.profile.city ? ` · ${session.profile.city}` : ""}
          </p>
        </div>
        <Link
          href="/account/profile"
          className="rounded-full border border-plum px-4 py-2 text-sm font-semibold text-plum hover:bg-plum-soft"
        >
          עריכת פרופיל
        </Link>
      </section>
    </div>
  );
}
