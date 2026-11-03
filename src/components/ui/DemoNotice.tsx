export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-2xl border border-gold/50 bg-tone-sand/50 px-4 py-3 text-sm text-ink"
    >
      <span aria-hidden className="text-lg leading-6 text-ink-soft">
        ⓘ
      </span>
      <div>{children}</div>
    </div>
  );
}
