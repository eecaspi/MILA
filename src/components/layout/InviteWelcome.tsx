"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SEEN_KEY = "liky-invite-seen";

/** A personal welcome for people who open the site from an invitation link: liky.club/?for=NAME. */
export function InviteWelcome() {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("for");
    const clean = (raw ?? "").replace(/[<>]/g, "").trim().slice(0, 40);
    if (!clean) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === clean) return;
    } catch {
      // Storage blocked: show it anyway.
    }
    setName(clean);
    const t = setTimeout(() => {
      if (!ref.current || ref.current.open) return;
      ref.current.showModal();
      try {
        localStorage.setItem(SEEN_KEY, clean);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(t);
  }, []);

  if (!name) return null;
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="invite-title"
      className="m-auto w-[min(88vw,26rem)] max-h-[90dvh] overflow-y-auto rounded-[2rem] bg-[#fbf1ec] p-0 text-ink shadow-2xl backdrop:bg-black/60"
    >
      <div className="px-6 pb-7 pt-7 text-center sm:px-8 sm:pb-9 sm:pt-9">
        <Image src="/brand/liky-logo.png" alt="ליקי" width={160} height={128} className="mx-auto h-14 w-auto sm:h-16" />
        <p className="mt-5 inline-block rounded-full bg-accent-soft px-4 py-1 text-sm font-bold text-accent">גישה מוקדמת</p>
        <h2 id="invite-title" className="mt-3 text-2xl font-extrabold leading-tight text-[#3f1d20] sm:text-3xl">
          {name}, הוזמנתם להיות מהראשונים לראות את ליקי
        </h2>
        <p className="mt-3 text-base leading-snug text-ink-soft sm:text-lg">האתר עדיין בבנייה, ואתם מקבלים הצצה מיוחדת לפני כולם.</p>
        <div className="relative mx-auto mt-3 h-28 w-32 sm:h-36 sm:w-40">
          <Image src="/brand/liky-phone.webp" alt="" fill sizes="10rem" unoptimized className="object-contain object-bottom" />
        </div>
        <button type="button" onClick={close} className="btn-primary mt-4 w-full !py-3 text-lg font-bold sm:text-xl">
          כניסה לאתר
        </button>
      </div>
    </dialog>
  );
}
