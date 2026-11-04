"use client";

import { useState } from "react";

/** Password input with a show/hide button, so typing mistakes are easy to spot. */
export function PasswordField({
  id,
  label,
  hint,
  ...input
}: {
  id: string;
  label: string;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={input.name ?? id}
          type={visible ? "text" : "password"}
          dir="ltr"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-line bg-raised py-3 ps-14 pe-4 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent disabled:opacity-60"
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute inset-y-0 start-0 flex w-14 items-center justify-center rounded-s-xl text-xs font-semibold text-accent hover:text-accent-bright"
        >
          {visible ? "הסתרה" : "הצגה"}
        </button>
      </div>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
