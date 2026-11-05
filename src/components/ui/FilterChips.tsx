import Link from "next/link";

export interface FilterOption {
  value: string | undefined;
  label: string;
}

/**
 * Server-rendered filter chips that update one query parameter while keeping the others.
 * Works without JavaScript.
 */
export function FilterChips({
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

  return (
    <nav aria-label={label} className="md:flex md:items-center md:gap-4">
      <p className="mb-1.5 text-xs font-bold text-ink-soft md:mb-0 md:w-32 md:shrink-0 md:text-sm">{label}</p>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <li key={option.value ?? "all"} className="shrink-0">
              <Link
                href={hrefFor(option.value)}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={[
                  "inline-block whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface text-ink-soft hover:border-accent/40 hover:text-accent",
                ].join(" ")}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
