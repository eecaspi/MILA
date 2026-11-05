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
      <form ref={formRef} action="/deals" role="search" className="relative">
        {Object.entries(hidden).map(([name, v]) =>
          v ? <input key={name} type="hidden" name={name} value={v} /> : null,
        )}
        <div
          className={`flex items-center gap-2 rounded-full border-2 border-line p-1.5 pe-1.5 ps-5 transition-colors focus-within:border-accent ${
            raised ? "bg-surface shadow-[var(--shadow-card)]" : "bg-canvas"
          }`}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-ink-soft" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="text"
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
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-soft/60 md:text-lg"
          />
          {value && (
            <button
              type="button"
              aria-label="ניקוי"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="shrink-0 rounded-full px-2 text-2xl leading-none text-ink-soft hover:text-ink"
            >
              ×
            </button>
          )}
          <button type="submit" className="btn-primary shrink-0 px-6 py-2.5 md:px-8">
            חיפוש
          </button>
        </div>
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-3xl border border-line bg-surface py-2 shadow-[var(--shadow-card)]"
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
                className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 text-base text-ink ${
                  i === active ? "bg-accent-soft" : ""
                }`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-ink-soft" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                {m}
              </li>
            ))}
          </ul>
        )}
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
