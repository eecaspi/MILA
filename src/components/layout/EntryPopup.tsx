"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SitePopup } from "@/lib/data/popup";

const KEY = "liky-popup-seen";

/** Opens once per visitor (per popup version) right after the site loads. */
export function EntryPopup({ popup }: { popup: SitePopup }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {}
    if (seen === popup.version) return;
    const t = setTimeout(() => ref.current?.showModal(), 600);
    return () => clearTimeout(t);
  }, [popup.version]);

  const close = () => {
    try {
      localStorage.setItem(KEY, popup.version);
    } catch {}
    ref.current?.close();
  };

  const external = /^https?:\/\//.test(popup.linkUrl);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="entry-popup-title"
      className="m-auto w-[min(92vw,26rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative p-6 pt-12 text-center">
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-accent-soft text-lg font-bold text-ink"
        >
          ✕
        </button>
        {popup.title && (
          <h2 id="entry-popup-title" className="text-2xl font-bold leading-snug">
            {popup.title}
          </h2>
        )}
        {popup.body && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft">{popup.body}</p>}
        {popup.buttonLabel && popup.linkUrl && (
          <div className="mt-5">
            {external ? (
              <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={close} className="btn-primary px-6 py-2.5">
                {popup.buttonLabel}
              </a>
            ) : (
              <Link href={popup.linkUrl} onClick={close} className="btn-primary px-6 py-2.5">
                {popup.buttonLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
