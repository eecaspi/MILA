"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SitePopup } from "@/lib/data/popup";

/** Opens right after the site loads (every time the site is opened), and closes with the X. */
export function EntryPopup({ popup }: { popup: SitePopup }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.showModal(), 600);
    return () => clearTimeout(t);
  }, []);

  const close = () => ref.current?.close();

  const external = /^https?:\/\//.test(popup.linkUrl);

  return (
    <dialog
      ref={ref}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="entry-popup-title"
      className="m-auto w-[min(92vw,26rem)] overflow-hidden rounded-3xl border-4 border-accent bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative p-6 pt-14 text-center">
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-accent text-lg font-bold text-on-accent shadow"
        >
          ✕
        </button>
        <div className="-mx-6 -mt-14 mb-4 bg-accent-soft px-6 pb-4 pt-14">
          <Image
            src={popup.imageUrl || "/brand/liky-character-bag.jpg"}
            alt={popup.title || "ליקי"}
            width={800}
            height={800}
            sizes="26rem"
            priority
            className="mx-auto h-auto max-h-[40vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
        {popup.title && (
          <h2 id="entry-popup-title" className="text-2xl font-bold leading-snug text-accent">
            {popup.title}
          </h2>
        )}
        {popup.body && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft">{popup.body}</p>}
        {popup.buttonLabel && (
          <div className="mt-5">
            {!popup.linkUrl ? (
              <button type="button" onClick={close} className="btn-primary px-6 py-2.5">
                {popup.buttonLabel}
              </button>
            ) : external ? (
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
