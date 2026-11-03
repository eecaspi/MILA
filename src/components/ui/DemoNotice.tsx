export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink"
    >
      <span aria-hidden className="text-lg leading-6 text-accent">
        ⓘ
      </span>
      <div>{children}</div>
    </div>
  );
}
