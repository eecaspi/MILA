/** A short ranked list with a proportional bar behind each value. */
export function RankList({
  title,
  rows,
  empty = "אין עדיין נתונים לתקופה הזו",
}: {
  title: string;
  rows: { label: string; sub?: string; value: number }[];
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-base text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">{empty}</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="relative overflow-hidden rounded-lg px-3 py-1.5">
              <span
                aria-hidden
                className="absolute inset-y-0 start-0 rounded-lg bg-accent-soft"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
              <span className="relative flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink">
                  {r.label}
                  {r.sub && <span className="text-ink-soft"> · {r.sub}</span>}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">
                  {r.value.toLocaleString("he-IL")}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
