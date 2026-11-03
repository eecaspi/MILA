export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-ink"
    >
      <span aria-hidden className="text-lg leading-6 text-gold">
        ⓘ
      </span>
      <div>{children}</div>
    </div>
  );
}
