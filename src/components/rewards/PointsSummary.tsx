import type { MemberRewards } from "@/lib/rewards/queries";

export function PointsSummary({
  balance,
  programEnabled,
}: Pick<MemberRewards, "balance" | "programEnabled">) {
  return (
    <section
      aria-labelledby="my-points"
      className="gold-frame relative overflow-hidden rounded-[var(--radius-card)] p-6 md:p-8"
    >
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="my-points" className="eyebrow">
            הנקודות שלי
          </h2>
          {!programEnabled && (
            <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold text-gold">
              צבירת נקודות — בקרוב
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-ink-soft">נקודות זמינות</dt>
            <dd className="font-display text-5xl font-medium tabular-nums text-gold">
              {balance.available.toLocaleString("he-IL")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">נקודות בהמתנה</dt>
            <dd className="font-display text-5xl font-medium tabular-nums text-ink/70">
              {balance.pending.toLocaleString("he-IL")}
            </dd>
          </div>
        </dl>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-sm text-ink-soft">
          <div className="flex gap-1.5">
            <dt>נצברו עד היום:</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {balance.total_earned.toLocaleString("he-IL")}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>מומשו:</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {balance.total_redeemed.toLocaleString("he-IL")}
            </dd>
          </div>
        </dl>

        {balance.pending > 0 && (
          <p className="mt-3 text-xs text-ink-soft">
            נקודות בהמתנה הופכות לזמינות אחרי שהחנות מאשרת את הקנייה. קנייה שבוטלה לא מזכה בנקודות.
          </p>
        )}
      </div>
    </section>
  );
}
