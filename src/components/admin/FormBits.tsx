"use client";

import { useFormStatus } from "react-dom";

export { inputClass } from "./styles";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "שומרת…" : children}
    </button>
  );
}

/** Current image with an option to remove it, plus a file picker for a new one. */
export function ImageField({
  label,
  name,
  current,
  removeName,
  error,
}: {
  label: string;
  name: string;
  current?: string | null;
  removeName: string;
  error?: string;
}) {
  return (
    <Field label={label} name={name} error={error} hint="JPG, PNG או WEBP, עד 5MB">
      {current && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
          <img
            src={current}
            alt=""
            className="size-16 rounded-xl border border-line object-cover"
          />
          <Check name={removeName} label="להסיר את התמונה" />
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="block w-full text-sm text-ink-soft file:me-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:font-semibold file:text-accent"
      />
    </Field>
  );
}

/** Photos from the business: current ones (each can be removed) plus a multi-file picker. */
export function GalleryField({ current, error }: { current: string[]; error?: string }) {
  return (
    <div className="sm:col-span-2">
      <Field
        label="תמונות מהעסק"
        name="gallery"
        error={error}
        hint="עד 8 תמונות: מוצרים, החנות, עבודות. מופיעות כשעומדים על העסק באתר."
      >
        {current.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {current.map((url) => (
              <li key={url} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
                <img
                  src={url}
                  alt=""
                  className="size-20 rounded-xl border border-line object-cover"
                />
                <label className="flex items-center gap-1 text-xs text-ink-soft">
                  <input type="checkbox" name="remove_gallery" value={url} className="size-3.5" />
                  להסיר
                </label>
              </li>
            ))}
          </ul>
        )}
        <input
          id="gallery"
          name="gallery"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="block w-full text-sm text-ink-soft file:me-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:font-semibold file:text-accent"
        />
      </Field>
    </div>
  );
}
