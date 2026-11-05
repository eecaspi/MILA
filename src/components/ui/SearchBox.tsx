"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { normalize } from "@/lib/data/search";

/**
 * The search box: a big round field with a button. While typing, a small styled list shows only
 * the matching suggestions (business names, categories, tags, offer titles). Works without JavaScript.
 */
export function SearchBox({
  suggestions,
  defaultValue,
  hidden = {},
  raised = false,
  hints = [],
}: {
  suggestions: string[];
  defaultValue?: string;
  /** Filters to keep when searching, as hidden fields. */
  hidden?: Record<string, string | undefined>;
  /** White field with a soft shadow (for use on the pink page). */
  raised?: boolean;
  /** Ideas for what to search, shown as small links under the box. */
  hints?: string[];
}) {
  const listId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const normalized = useMemo(() => suggestions.map((s) => ({ s, n: normalize(s) })), [suggestions]);
  const matches = useMemo(() => {
    const q = normalize(value);
    if (q.length < 1) return [];
    const starts: string[] = [];
    const contains: string[] = [];
    for (const { s, n } of normalized) {
      if (n === q) continue;
      if (n.startsWith(q)) starts.push(s);
      else if (n.includes(q)) contains.push(s);
    }
    return [...starts, ...contains].slice(0, 6);
  }, [value, normalized]);

  const showList = open && matches.length > 0;

  function pick(text: string) {
    setValue(text);
    setOpen(false);
    setActive(-1);
    // Let React update the input value before submitting.
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      const chosen = matches[active];
      if (!chosen) return;
      e.preventDefault();
      pick(chosen);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div>
      <form ref={formRef} action="/deals" role="search" className="relative flex gap-2">
        {Object.entries(hidden).map(([name, v]) =>
          v ? <input key={name} type="hidden" name={name} value={v} /> : null,
        )}
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            name="q"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            maxLength={60}
            autoComplete="off"
            enterKeyHint="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            placeholder="מה מחפשים? למשל: פאות, בגדי ילדים, תכשיטים"
            aria-label="חיפוש הטבות ועסקים"
            className={`w-full rounded-full border-2 border-line px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent md:text-lg ${
              raised ? "bg-surface shadow-[var(--shadow-card)]" : "bg-canvas"
            }`}
          />
          {showList && (
            <ul
              id={listId}
              role="listbox"
              className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface py-1 shadow-[var(--shadow-card)]"
            >
              {matches.map((m, i) => (
                <li
                  key={m}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(m);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`cursor-pointer px-5 py-2.5 text-base text-ink ${
                    i === active ? "bg-accent-soft" : ""
                  }`}
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="btn-primary px-7">
          חיפוש
        </button>
      </form>
      {hints.length > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>נסי לחפש:</span>
          {hints.map((h) => (
            <Link
              key={h}
              href={`/deals?q=${encodeURIComponent(h)}`}
              className="rounded-full border border-line bg-surface px-3 py-0.5 font-medium text-ink hover:border-accent hover:text-accent"
            >
              {h}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
