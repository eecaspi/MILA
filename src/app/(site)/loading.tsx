export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-6xl px-4 py-16">
      <span className="sr-only">טוענת…</span>
      <div className="mb-8 h-8 w-56 animate-pulse rounded-full bg-raised" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-[var(--radius-card)] bg-raised" />
        ))}
      </div>
    </div>
  );
}
