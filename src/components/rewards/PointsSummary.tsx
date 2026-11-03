import type { MemberRewards } from "@/lib/rewards/queries";

export function PointsSummary({
  balance,
  programEnabled,
}: Pick<MemberRewards, "balance" | "programEnabled">) {
  return (
    <section
      aria-labelledby="my-points"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-plum p-6 text-white"
    >
      <div
        aria-hidden
        className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="my-points" className="text-lg font-bold">
            הנקודות שלי
          </h2>
          {!programEnabled && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              צבירת נקודות — בקרוב
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-white/75">נקודות זמינות</dt>
            <dd className="text-4xl font-extrabold tabular-nums">
              {balance.available.toLocaleString("he-IL")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/75">נקודות בהמתנה</dt>
            <dd className="text-4xl font-extrabold tabular-nums text-white/80">
              {balance.pending.toLocaleString("he-IL")}
            </dd>
          </div>
        </dl>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/15 pt-4 text-sm text-white/75">
          <div className="flex gap-1.5">
            <dt>נצברו עד היום:</dt>
            <dd className="font-semibold tabular-nums text-white">
              {balance.total_earned.toLocaleString("he-IL")}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>מומשו:</dt>
            <dd className="font-semibold tabular-nums text-white">
              {balance.total_redeemed.toLocaleString("he-IL")}
            </dd>
          </div>
        </dl>

        {balance.pending > 0 && (
          <p className="mt-3 text-xs text-white/70">
            נקודות בהמתנה הופכות לזמינות אחרי שהחנות מאשרת את הקנייה. קנייה שבוטלה לא מזכה בנקודות.
          </p>
        )}
      </div>
    </section>
  );
}
