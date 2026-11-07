"use client";

import { useRef, useState } from "react";

/**
 * Admin sharing kit: the offer's picture, a ready message (with the coupon code and the link),
 * and buttons to send it to WhatsApp, download the picture or copy the code / message.
 */
export function ShareDialog({
  imagePath,
  message,
  code,
  url,
  compact,
  warning,
  className = "",
}: {
  imagePath: string;
  message: string;
  code?: string;
  url: string;
  compact: boolean;
  /** Shown above the message when the code is not part of it, and why. */
  warning?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // WhatsApp on a computer garbles emoji that arrive through a link (they show as �),
  // so the link version of the message goes without them. Copying the message keeps them.
  const linkText = message
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/^[ \t]+/gm, "");
  const waLink = `https://wa.me/?text=${encodeURIComponent(linkText)}`;
  const [note, setNote] = useState("");

  const say = (text: string) => {
    setNote(text);
    setTimeout(() => setNote(""), 2500);
  };

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      say(done);
    } catch {
      say("ההעתקה לא הצליחה, אפשר לסמן ולהעתיק ידנית");
    }
  }

  async function shareWithImage() {
    const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isPhone) {
      try {
        const blob = await (await fetch(imagePath)).blob();
        const file = new File([blob], "liky-offer.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: message });
          return;
        }
      } catch {
        /* fall through to the computer way */
      }
    }
    // On a computer WhatsApp cannot receive a picture from a link: copy the picture, open WhatsApp
    // with the message, and the picture is pasted into the chat with Ctrl/Cmd+V.
    let copied = false;
    try {
      const write = navigator.clipboard.write([
        new ClipboardItem({ "image/png": fetch(imagePath).then((r) => r.blob()) }),
      ]);
      window.open(waLink, "_blank", "noopener,noreferrer");
      await write;
      copied = true;
    } catch {
      window.open(waLink, "_blank", "noopener,noreferrer");
    }
    say(
      copied
        ? "התמונה הועתקה. בוואטסאפ לוחצים Ctrl+V (או Cmd+V) והתמונה נכנסת להודעה"
        : "וואטסאפ נפתח עם ההודעה. להורדת התמונה ולצירוף ידני: כפתור הורדת התמונה",
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={
          compact
            ? `inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-surface hover:bg-ink/85 ${className}`
            : `btn-secondary w-full py-2.5 text-[15px] ${className}`
        }
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
        </svg>
        {compact ? "שיתוף בקבוצה (מנהלת)" : "שיתוף בקבוצת הוואטסאפ (מנהלת)"}
      </button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(92vw,26rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-[var(--shadow-card)] backdrop:bg-ink/40"
      >
        <div className="max-h-[90vh] space-y-3 overflow-y-auto p-5">
          <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-center justify-between bg-surface px-5 pb-2 pt-5">
            <p className="font-display text-lg font-bold">שיתוף בקבוצה</p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="סגירה"
              className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-2xl leading-none text-ink hover:bg-line"
            >
              ×
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePath}
            alt="תמונת ההטבה לשיתוף"
            width={1080}
            height={1350}
            loading="lazy"
            className="w-full rounded-2xl border border-line bg-canvas"
          />
          {warning && (
            <p className="rounded-2xl bg-accent-soft p-3 text-sm font-semibold text-ink">{warning}</p>
          )}
          <textarea
            readOnly
            value={message}
            rows={5}
            className="w-full resize-none rounded-2xl border border-line bg-canvas p-3 text-sm text-ink"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" onClick={shareWithImage} className="btn-primary w-full py-2.5">
            שליחה בוואטסאפ עם תמונה
          </button>
          <div className="grid grid-cols-2 gap-2">
            {code ? (
              <button type="button" onClick={() => copy(code, "הקוד הועתק")} className="btn-secondary py-2 text-sm">
                העתקת הקוד
              </button>
            ) : null}
            <button type="button" onClick={() => copy(message, "ההודעה הועתקה")} className="btn-secondary py-2 text-sm">
              העתקת ההודעה
            </button>
            <a href={imagePath} download="liky-offer.png" className="btn-secondary py-2 text-sm">
              הורדת התמונה
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2 text-sm"
            >
              וואטסאפ (טקסט)
            </a>
            {code ? (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(code)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary col-span-2 py-2 text-sm"
              >
                שליחת הקוד לבדו בהודעה נפרדת (קל להעתקה)
              </a>
            ) : null}
            <button type="button" onClick={() => copy(url, "הקישור הועתק")} className="btn-secondary py-2 text-sm">
              העתקת הקישור
            </button>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="btn-secondary w-full py-2.5">
            סגירה
          </button>
          <p aria-live="polite" className="min-h-5 text-center text-sm font-semibold text-accent">
            {note}
          </p>
        </div>
      </dialog>
    </>
  );
}
