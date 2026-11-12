"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const SEEN_KEY = "liky-popup-seen";
/** Pages where a popup would get in the way of what the person came to do. */
const QUIET_PATHS = /^\/(login|auth|reset-password|admin)(\/|$)/;

/** Opens once per browser (and again only when the popup is edited in the back office), and closes with the X. */

export function EntryPopup({ popup }: { popup: SitePopup }) {
  const ref = useRef<HTMLDialogElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    if (QUIET_PATHS.test(pathname)) return;
    // Someone who arrived from an invitation link sees the personal welcome instead.
    try {
      if (new URLSearchParams(window.location.search).has("for") || new URLSearchParams(window.location.search).has("invite") || localStorage.getItem("liky-invite-name")) return;
    } catch {
      // ignore
    }
    try {
      if (localStorage.getItem(SEEN_KEY) === popup.version) return;
    } catch {
      // Storage blocked: fall through and show it, once per page load.
    }
    const t = setTimeout(() => {
      if (!ref.current || ref.current.open) return;
      ref.current.showModal();
      try {
        localStorage.setItem(SEEN_KEY, popup.version);
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [pathname, popup.version]);

  const close = () => ref.current?.close();

  // No file uploaded in the admin: Liky (without a background) looking at her phone.
  const likyMedia = popup.likyUrl || "/brand/liky-phone.webp";
  const external = /^https?:\/\//.test(popup.linkUrl);
  const btn = "mt-3 block w-full rounded-full border-2 border-accent bg-white px-5 py-3 text-center text-base sm:mt-5 sm:px-6 sm:py-4 sm:text-xl font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent";

  return (
    <dialog
      ref={ref}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="entry-popup-title"
      className="m-auto w-[min(76vw,18rem)] max-h-[85dvh] overflow-y-auto rounded-[1.5rem] sm:w-[min(92vw,26rem)] sm:rounded-[2rem] bg-[#fbf1ec] p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative px-4 pb-4 pt-4 text-center sm:px-5 sm:pb-6 sm:pt-5">
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="absolute start-4 top-4 z-10 grid size-9 place-items-center text-2xl leading-none text-ink"
        >
          ✕
        </button>
        {popup.logoUrl && (
          <div className="mx-auto mt-4 flex h-9 w-fit max-w-[60%] sm:mt-6 sm:h-16 sm:max-w-[70%] items-center justify-center">
            <Image src={popup.logoUrl} alt="" width={320} height={120} sizes="10rem" className="h-full w-auto object-contain" />
          </div>
        )}
        <h2 id="entry-popup-title" className="mt-3 text-lg font-extrabold leading-tight text-[#3f1d20] sm:mt-5 sm:text-2xl">
          <Title text={popup.title || "חדש בליקי"} />
        </h2>
        {popup.body && <p className="mt-1 whitespace-pre-line text-center text-xs leading-snug text-ink-soft sm:text-sm">{popup.body}</p>}
        {/* Liky stands on the picture (a video or a picture without a background looks best). */}
        <div className={`relative mx-auto mt-1 h-20 w-24 sm:mt-2 sm:h-36 sm:w-40 ${popup.imageUrl ? "-mb-4 sm:-mb-6" : ""}`}>
          {/\.(mp4|webm)$/i.test(likyMedia) ? (
            <video src={likyMedia} aria-hidden autoPlay muted loop playsInline className="absolute inset-0 size-full object-contain object-bottom" />
          ) : (
            <Image src={likyMedia} alt="ליקי" fill sizes="10rem" priority unoptimized className="object-contain object-bottom" />
          )}
        </div>
        {popup.imageUrl && (
          <div className="relative z-10 aspect-[16/8] sm:aspect-[16/10] overflow-hidden rounded-3xl border border-[#3f1d20] bg-[#f3f1f1]">
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
