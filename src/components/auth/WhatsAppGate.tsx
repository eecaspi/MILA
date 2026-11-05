"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shown right after sign-up for members who chose the WhatsApp group. It has no close button,
 * ignores Escape and clicks outside, and the page behind it can't be reached: it opens only
 * after she taps "join" (which opens WhatsApp) or ticks "I'm already in the group".
 */
const COOKIE = "liky_wa_done";

function remember() {
  try {
    document.cookie = `${COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* the window just shows again after a reload */
  }
}

export function WhatsAppGate({ url }: { url: string }) {
  const [open, setOpen] = useState(true);
  const joinRef = useRef<HTMLAnchorElement>(null);

  // Back from WhatsApp (the phone often reloads this page): she already did this step.
  useEffect(() => {
    try {
      if (document.cookie.split("; ").includes(`${COOKIE}=1`)) setOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  function done() {
    remember();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    joinRef.current?.focus();
    // Keep keyboard focus inside the window.
    const keep = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(
        document.querySelectorAll<HTMLElement>("[data-gate] a, [data-gate] input"),
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const current = document.activeElement;
      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      } else if (!items.includes(current as HTMLElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keep);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", keep);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div
        data-gate
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        className="w-full max-w-md rounded-[var(--radius-card)] bg-surface p-7 text-center shadow-[var(--shadow-card)]"
      >
        <h2 id="gate-title" className="text-2xl text-ink">
          עוד צעד אחד: מצטרפות לקבוצה
        </h2>
        <p className="mt-3 text-ink-soft">
          הקבוצה שלנו בוואטסאפ היא המקום לקבל הטבות חדשות והמלצות ישר לטלפון. הצטרפי עכשיו, ואז נמשיך
          לאתר.
        </p>
        <a
          ref={joinRef}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={done}
          className="btn-primary mt-6 w-full py-4 text-lg"
        >
          הצטרפי לקבוצת הוואטסאפ
        </a>
        <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            onChange={(e) => e.target.checked && done()}
            className="size-4 accent-[var(--color-accent)]"
          />
          אני כבר בקבוצה
        </label>
      </div>
    </div>
  );
}
