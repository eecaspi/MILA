"use client";

import { useEffect, useRef, useState } from "react";

type Platform = "hidden" | "ios" | "android";

/** "הוסיפי את ליקי לטלפון": explains how to put a shortcut on the home screen (nothing installs by itself). */
export function InstallAppButton({ className = "", strip = false }: { className?: string; strip?: boolean }) {
  const [platform, setPlatform] = useState<Platform>("hidden");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1)) setPlatform("ios");
    else if (/Android/i.test(ua)) setPlatform("android");
  }, []);

  if (platform === "hidden") return null;

  const button = (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`btn-secondary inline-flex items-center gap-2 ${className}`}
      >
        <span aria-hidden>📲</span>
        הוסיפי את ליקי לטלפון
      </button>
      <p className="mt-1 text-xs text-ink-soft">בלחיצה אחת, ובלי להוריד כלום מהחנות.</p>
    </>
  );

  return (
    <>
      {strip ? (
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-accent-soft px-4 py-4 text-center">
          <p className="mb-2 font-display text-base font-bold text-ink">ליקי תמיד איתך, על מסך הבית</p>
          {button}
        </div>
      ) : (
        button
      )}

      <dialog
        ref={dialog}
        aria-labelledby="install-title"
        className="m-auto max-h-[90dvh] w-[min(88vw,24rem)] overflow-y-auto rounded-3xl bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60"
      >
        <h2 id="install-title" className="text-xl font-extrabold">הוספת ליקי למסך הבית</h2>
        {platform === "ios" ? (
          <>
            <p className="mt-3 text-sm font-bold">בספארי:</p>
            <ol className="mt-1 list-decimal space-y-1 ps-5 text-base">
              <li>
                לוחצות על כפתור השיתוף <span aria-hidden>⬆️</span> בתחתית המסך.
              </li>
              <li>בוחרות &quot;הוספה למסך הבית&quot;.</li>
              <li>לוחצות &quot;הוספה&quot;.</li>
            </ol>
            <p className="mt-3 text-sm font-bold">בכרום (גוגל):</p>
            <ol className="mt-1 list-decimal space-y-1 ps-5 text-base">
              <li>
                לוחצות על כפתור השיתוף <span aria-hidden>⬆️</span> למעלה, ליד שורת הכתובת.
              </li>
              <li>בוחרות &quot;הוספה למסך הבית&quot;.</li>
              <li>לוחצות &quot;הוספה&quot;.</li>
            </ol>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm font-bold">בכרום (גוגל):</p>
            <ol className="mt-1 list-decimal space-y-1 ps-5 text-base">
              <li>
                לוחצות על שלוש הנקודות <span aria-hidden>⋮</span> למעלה.
              </li>
              <li>בוחרות &quot;הוספה למסך הבית&quot;.</li>
              <li>לוחצות &quot;הוספה&quot;.</li>
            </ol>
            <p className="mt-3 text-sm font-bold">בדפדפן סמסונג:</p>
            <ol className="mt-1 list-decimal space-y-1 ps-5 text-base">
              <li>
                לוחצות על התפריט <span aria-hidden>☰</span> למטה.
              </li>
              <li>בוחרות &quot;הוספת דף אל&quot; ואז &quot;מסך הבית&quot;.</li>
              <li>לוחצות &quot;הוספה&quot;.</li>
            </ol>
          </>
        )}
        <p className="mt-3 text-sm text-ink-soft">האייקון של ליקי יופיע בין האפליקציות.</p>
        <button type="button" onClick={() => dialog.current?.close()} className="btn-primary mt-5 w-full !py-2.5">
          הבנתי
        </button>
      </dialog>
    </>
  );
}
