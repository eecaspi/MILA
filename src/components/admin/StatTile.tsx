export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 text-3xl font-bold tabular-nums text-plum">
        {typeof value === "number" ? value.toLocaleString("he-IL") : value}
      </dd>
    </div>
  );
}
