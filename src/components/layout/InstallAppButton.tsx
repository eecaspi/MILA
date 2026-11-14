"use client";

import { useEffect, useRef, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "hidden" | "native" | "ios";

/** "הוסיפי את ליקי לטלפון": a real install prompt on Android, short steps on iPhone. */
export function InstallAppButton({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("hidden");
  const prompt = useRef<InstallPromptEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      prompt.current = e as InstallPromptEvent;
      setMode("native");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    if (iOS) setMode("ios");

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  const click = async () => {
    if (mode === "native" && prompt.current) {
      await prompt.current.prompt();
      await prompt.current.userChoice;
      prompt.current = null;
      setMode("hidden");
    } else {
      dialog.current?.showModal();
    }
  };

  return (
    <>
      <button type="button" onClick={click} className={`btn-secondary inline-flex items-center gap-2 ${className}`}>
        <span aria-hidden>📲</span>
        הוסיפי את ליקי לטלפון
      </button>
      <p className="mt-1 text-xs text-ink-soft">בלחיצה אחת, ובלי להוריד כלום מהחנות.</p>

      <dialog
        ref={dialog}
        aria-labelledby="install-title"
        className="m-auto w-[min(88vw,24rem)] max-h-[90dvh] overflow-y-auto rounded-3xl bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60"
      >
        <h2 id="install-title" className="text-xl font-extrabold">הוספת ליקי למסך הבית</h2>
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
        <p className="mt-3 text-sm text-ink-soft">האייקון של ליקי יופיע בין האפליקציות.</p>
        <button type="button" onClick={() => dialog.current?.close()} className="btn-primary mt-5 w-full !py-2.5">
          הבנתי
        </button>
      </dialog>
    </>
  );
}
