import type { MemberRewards } from "@/lib/rewards/queries";

export function PointsSummary({
  balance,
  programEnabled,
}: Pick<MemberRewards, "balance" | "programEnabled">) {
  return (
    <section aria-labelledby="my-points" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="my-points" className="text-2xl text-ink">
          הנקודות שלי
        </h2>
        {!programEnabled && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent">
            צבירת נקודות — בקרוב
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="accent-frame rounded-[var(--radius-card)] p-5">
          <dt className="text-sm font-semibold text-ink-soft">נקודות זמינות</dt>
          <dd className="mt-2 text-5xl font-extrabold tabular-nums text-ink">
            {balance.available.toLocaleString("he-IL")}
          </dd>
        </div>
        <div className="rounded-[var(--radius-card)] bg-surface p-5">
          <dt className="text-sm font-semibold text-ink-soft">נקודות בהמתנה</dt>
          <dd className="mt-2 text-5xl font-extrabold tabular-nums text-ink">
            {balance.pending.toLocaleString("he-IL")}
          </dd>
          {balance.pending > 0 && (
            <p className="mt-2 text-xs text-ink-soft">יהפכו לזמינות אחרי אישור הקנייה</p>
          )}
        </div>
      </dl>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-[var(--radius-card)] bg-surface px-5 py-3 text-sm text-ink-soft">
        <div className="flex gap-1.5">
          <dt>נצברו עד היום:</dt>
          <dd className="font-bold tabular-nums text-ink">
            {balance.total_earned.toLocaleString("he-IL")}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>מומשו:</dt>
          <dd className="font-bold tabular-nums text-ink">
            {balance.total_redeemed.toLocaleString("he-IL")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
