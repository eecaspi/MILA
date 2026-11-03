import Link from "next/link";
import { StatTile } from "@/components/admin/StatTile";
import { getBusinesses, getOffers } from "@/lib/data/repository";
import type { RewardsStats } from "@/lib/rewards/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const [businesses, offers, stats] = await Promise.all([
    getBusinesses({ includeSamples: true }),
    getOffers({ activeOnly: false }),
    supabase.rpc("admin_rewards_stats"),
  ]);
  const rewards = stats.data as RewardsStats | null;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-medium text-ink">סקירה</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-ink">מועדון MILA</h2>
          <Link href="/admin/rewards" className="text-sm font-semibold text-gold hover:underline">
            לניהול הנקודות ←
          </Link>
        </div>
        {rewards ? (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="חברות במועדון" value={rewards.members} />
            <StatTile label="נקודות זמינות (סה״כ)" value={rewards.points_available} />
            <StatTile label="נקודות בהמתנה (סה״כ)" value={rewards.points_pending} />
            <StatTile label="קניות ממתינות לאימות" value={rewards.pending_conversions} />
          </dl>
        ) : (
          <p className="text-sm text-ink-soft">לא הצלחנו לטעון את נתוני המועדון.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-ink">מדריך והצעות</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="עסקים (כולל לדוגמה)" value={businesses.length} />
          <StatTile label="הצעות" value={offers.length} />
        </dl>
        <p className="text-sm text-ink-soft">ניהול עסקים והצעות מתוך הממשק יתווסף בשלב הבא.</p>
      </section>
    </div>
  );
}
