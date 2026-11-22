"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "liky-a11y";
const MAX_SIZE = 3;

interface Prefs {
  size: number;
  contrast: boolean;
  links: boolean;
  still: boolean;
}

const DEFAULTS: Prefs = { size: 0, contrast: false, links: false, still: false };

function apply(p: Prefs) {
  const root = document.documentElement;
  root.style.fontSize = p.size ? `${100 + p.size * 12}%` : "";
  root.classList.toggle("a11y-contrast", p.contrast);
  root.classList.toggle("a11y-links", p.links);
  root.classList.toggle("a11y-still", p.still);
  if (p.still) document.querySelectorAll("video").forEach((v) => v.pause());
}

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      size: Math.min(MAX_SIZE, Math.max(0, Number(p.size) || 0)),
      contrast: !!p.contrast,
      links: !!p.links,
      still: !!p.still,
    };
  } catch {
    return DEFAULTS;
  }
}

/** A small, self-made accessibility menu: bigger text, strong contrast, underlined links, no motion. */
export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = load();
    setPrefs(p);
    apply(p);
  }, []);

  const update = useCallback((next: Prefs) => {
    setPrefs(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const toggle = (name: "contrast" | "links" | "still") => update({ ...prefs, [name]: !prefs[name] });
  const changed = prefs.size !== 0 || prefs.contrast || prefs.links || prefs.still;

  const option =
    "flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 text-start text-sm font-semibold transition";

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="תפריט נגישות"
        className="fixed bottom-4 start-4 z-40 grid size-11 place-items-center rounded-full border-2 border-accent bg-surface text-accent shadow-[var(--shadow-card)] transition hover:bg-accent-soft sm:bottom-6 sm:start-6"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4.5" r="1.8" />
          <path d="M5 8.5h14M12 8.5v5.5m0 0-3 6.5m3-6.5 3 6.5" />
        </svg>
      </button>

      {open && (
        <div
          ref={panel}
          id="a11y-panel"
          role="dialog"
          aria-label="תפריט נגישות"
          className="fixed bottom-20 start-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border-2 border-accent bg-surface p-4 text-ink shadow-[0_16px_48px_rgba(0,0,0,0.25)] sm:bottom-24 sm:start-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg font-extrabold">נגישות</p>
            <button type="button" onClick={close} aria-label="סגירה" className="grid size-8 place-items-center rounded-full text-xl leading-none hover:bg-accent-soft">
              ×
            </button>
          </div>

          <div className="space-y-2">
            <div className={`${option} border-line`}>
              <span>גודל טקסט</span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ ...prefs, size: Math.max(0, prefs.size - 1) })}
                  disabled={prefs.size === 0}
                  aria-label="הקטנת טקסט"
                  className="grid size-9 place-items-center rounded-full border-2 border-accent text-base font-extrabold text-accent disabled:opacity-40"
                >
                  א-
                </button>
                <button
                  type="button"
                  onClick={() => update({ ...prefs, size: Math.min(MAX_SIZE, prefs.size + 1) })}
                  disabled={prefs.size === MAX_SIZE}
                  aria-label="הגדלת טקסט"
                  className="grid size-9 place-items-center rounded-full border-2 border-accent text-base font-extrabold text-accent disabled:opacity-40"
                >
                  א+
                </button>
              </span>
            </div>
            {(
              [
                ["contrast", "ניגודיות גבוהה"],
                ["links", "הדגשת קישורים"],
                ["still", "עצירת אנימציות"],
              ] as const
            ).map(([name, label]) => (
              <button
                key={name}
                type="button"
                aria-pressed={prefs[name]}
                onClick={() => toggle(name)}
                className={`${option} w-full ${prefs[name] ? "border-accent bg-accent-soft" : "border-line"}`}
              >
                <span>{label}</span>
                <span aria-hidden className="text-accent">{prefs[name] ? "✓" : ""}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <Link href="/accessibility" onClick={() => setOpen(false)} className="font-semibold text-accent underline underline-offset-2">
              הצהרת נגישות
            </Link>
            {changed && (
              <button type="button" onClick={() => update(DEFAULTS)} className="text-ink-soft underline underline-offset-2">
                איפוס
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
