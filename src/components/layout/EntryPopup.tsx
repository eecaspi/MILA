"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SitePopup } from "@/lib/data/popup";

/** The title with its number (50%, 20…) picked out in red. */
function Title({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+%?|%\d+)/).map((part, i) =>
        /^(\d+%?|%\d+)$/.test(part) ? (
          <span key={i} className="text-accent">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Opens right after the site loads (every time the site is opened), and closes with the X. */
export function EntryPopup({ popup }: { popup: SitePopup }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.showModal(), 600);
    return () => clearTimeout(t);
  }, []);

  const close = () => ref.current?.close();

  const external = /^https?:\/\//.test(popup.linkUrl);
  const btn = "mt-5 block w-full rounded-full bg-accent px-6 py-4 text-center text-xl font-bold text-on-accent hover:opacity-90";

  return (
    <dialog
      ref={ref}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="entry-popup-title"
      className="m-auto w-[min(92vw,26rem)] overflow-hidden rounded-[2rem] bg-[#fbf1ec] p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative px-5 pb-6 pt-5 text-center">
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="absolute start-4 top-4 z-10 grid size-9 place-items-center text-2xl leading-none text-ink"
        >
          ✕
        </button>
        {popup.logoUrl && (
          <div className="mx-auto mt-6 flex h-16 w-fit max-w-[70%] items-center justify-center">
            <Image src={popup.logoUrl} alt="" width={320} height={120} sizes="10rem" className="h-full w-auto object-contain" />
          </div>
        )}
        {popup.body && <p className="mt-3 whitespace-pre-line text-center text-base leading-snug text-ink-soft">{popup.body}</p>}
        <div className="mt-2 flex items-end gap-2">
          <div className="min-w-0 flex-1 text-start">
            <h2 id="entry-popup-title" className="text-3xl font-extrabold leading-tight text-[#3f1d20]">
              <Title text={popup.title || "חדש בליקי"} />
            </h2>
          </div>
          {/* Liky stands small next to the text (a video or a picture without a background looks best). */}
          <div className="relative h-40 w-[34%] shrink-0">
            {/\.(mp4|webm)$/i.test(popup.likyUrl) ? (
              <video src={popup.likyUrl} autoPlay muted loop playsInline className="absolute inset-0 size-full object-contain object-bottom" />
            ) : (
              <Image
                src={popup.likyUrl || "/brand/liky-character-bag.jpg"}
                alt="ליקי"
                fill
                sizes="9rem"
                priority
                className="object-contain object-bottom"
              />
            )}
          </div>
        </div>
        {popup.imageUrl && (
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-3xl bg-[#f3f1f1]">
            <Image src={popup.imageUrl} alt="" fill sizes="26rem" className="object-cover" />
          </div>
        )}
        {popup.buttonLabel &&
          (!popup.linkUrl ? (
            <button type="button" onClick={close} className={btn}>
              {popup.buttonLabel}
            </button>
          ) : external ? (
            <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={close} className={btn}>
              {popup.buttonLabel}
            </a>
          ) : (
            <Link href={popup.linkUrl} onClick={close} className={btn}>
              {popup.buttonLabel}
            </Link>
          ))}
      </div>
    </dialog>
  );
}
