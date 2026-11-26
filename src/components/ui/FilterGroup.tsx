import Link from "next/link";
import type { FilterOption } from "./FilterChips";

/**
 * One filter shown as a collapsed row (label + current choice). Tapping it opens the options
 * as large, easy-to-press buttons. Opening one closes the others. Works without JavaScript.
 */
export function FilterGroup({
  basePath,
  param,
  options,
  current,
  otherParams = {},
  label,
}: {
  basePath: string;
  param: string;
  options: FilterOption[];
  current: string | undefined;
  otherParams?: Record<string, string | undefined>;
  label: string;
}) {
  function hrefFor(value: string | undefined) {
    const params = new URLSearchParams();
    for (const [key, v] of Object.entries(otherParams)) if (v) params.set(key, v);
    if (value) params.set(param, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }
  const selected = options.find((o) => o.value === current) ?? options[0];

  return (
    <details name="filters" className="group border-b border-line last:border-b-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-1 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-base font-bold text-ink">{label}</span>
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          <span className={current ? "rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent" : ""}>
            {selected?.label}
          </span>
          <span aria-hidden className="text-accent transition-transform group-open:rotate-180">⌄</span>
        </span>
      </summary>
      <nav aria-label={label} className="pb-4">
        <ul className="flex flex-wrap gap-2.5">
          {options.map((option) => {
            const active = option.value === current;
            return (
              <li key={option.value ?? "all"}>
                <Link
                  href={hrefFor(option.value)}
                  aria-current={active ? "true" : undefined}
                  scroll={false}
                  className={[
                    "inline-flex min-h-12 items-center rounded-full border px-5 text-base font-medium transition-colors",
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-ink hover:border-accent/50 hover:text-accent",
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </details>
  );
}
