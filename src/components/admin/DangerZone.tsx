/** A delete button behind a disclosure, so it takes two deliberate clicks. */
export function DangerZone({
  action,
  id,
  label,
  warning,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  label: string;
  warning: string;
}) {
  return (
    <details className="rounded-[var(--radius-card)] border border-danger/30 bg-surface p-5">
      <summary className="cursor-pointer text-sm font-semibold text-danger">{label}</summary>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <p className="text-sm text-ink-soft">{warning}</p>
        <button className="rounded-full bg-danger px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
          כן, למחוק לצמיתות
        </button>
      </form>
    </details>
  );
}
