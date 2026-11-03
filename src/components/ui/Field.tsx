export function Field({
  id,
  label,
  hint,
  ...input
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={input.name ?? id}
        className="rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-plum disabled:opacity-60"
        {...input}
      />
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-full bg-plum px-6 py-3 font-semibold text-white transition-colors hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
