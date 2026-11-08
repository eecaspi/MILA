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
      <div className="relative text-center">
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-surface text-lg font-bold text-accent shadow"
        >
          ✕
        </button>
        <div className="bg-accent px-6 pb-5 pt-12 text-on-accent">
          <h2 id="entry-popup-title" className="text-3xl font-extrabold leading-tight">
            {popup.title || "חדש בליקי"}
          </h2>
        </div>
        <div className="flex items-center justify-center gap-4 bg-accent-soft px-5 py-5">
          {popup.imageUrl && (
            <div className="grid size-32 shrink-0 place-items-center rounded-2xl border-2 border-accent bg-surface p-2 shadow-sm">
              <Image
                src={popup.imageUrl}
                alt="לוגו העסק"
                width={240}
                height={240}
                sizes="8rem"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <Image
            src="/brand/liky-character-bag.jpg"
            alt="ליקי"
            width={400}
            height={400}
            sizes="9rem"
            priority
            className="h-36 w-auto rounded-2xl object-contain mix-blend-multiply"
          />
        </div>
        <div className="px-6 pb-6 pt-4">
        {popup.body && <p className="whitespace-pre-line text-base leading-relaxed text-ink">{popup.body}</p>}
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
      </div>
    </dialog>
  );
}
