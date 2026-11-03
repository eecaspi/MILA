/** A headline number with its change against the previous period of the same length. */
export function TrendTile({
  label,
  value,
  previous,
}: {
  label: string;
  value: number;
  previous: number;
}) {
  const change = previous > 0 ? Math.round(((value - previous) / previous) * 100) : null;
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 text-3xl font-bold tabular-nums text-ink">
        {value.toLocaleString("he-IL")}
      </dd>
      <dd className="mt-1 text-xs text-ink-soft">
        {change === null ? (
          "אין נתונים להשוואה"
        ) : (
          <>
            <span className={change >= 0 ? "font-semibold text-sage" : "font-semibold text-danger"}>
              <span aria-hidden>{change >= 0 ? "▲" : "▼"}</span>{" "}
              <span className="ltr">{Math.abs(change)}%</span>
            </span>{" "}
            לעומת התקופה הקודמת
          </>
        )}
      </dd>
    </div>
  );
}
