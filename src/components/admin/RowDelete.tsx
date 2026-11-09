/** A small "delete" inside a list row: one click opens a confirmation, a second one deletes. */
export function RowDelete({
  action,
  id,
  name,
  warning,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  name: string;
  warning: string;
}) {
  return (
    <details className="group open:basis-full">
      <summary className="cursor-pointer list-none text-sm font-semibold text-danger hover:underline [&::-webkit-details-marker]:hidden">
        מחיקה
      </summary>
      <form action={action} className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-danger-soft p-3">
        <input type="hidden" name="id" value={id} />
        <p className="min-w-0 flex-1 text-sm text-ink">
          למחוק את &quot;{name}&quot; לצמיתות? {warning}
        </p>
        <button className="rounded-full bg-danger px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
          כן, למחוק
        </button>
      </form>
    </details>
  );
}
