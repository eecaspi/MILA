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
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <li key={option.value ?? "all"}>
              <Link
                href={hrefFor(option.value)}
                aria-current={active ? "true" : undefined}
                scroll={false}
                className={[
                  "inline-block rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-plum bg-plum text-white"
                    : "border-line bg-paper text-ink-soft hover:border-plum/40 hover:text-plum",
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
