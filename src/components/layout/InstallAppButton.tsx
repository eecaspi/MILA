"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

type Platform = "hidden" | "ios" | "android" | "samsung";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const ADDED_KEY = "liky-app-added";

/** The iPhone share icon: a square with an arrow pointing up out of it. */
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block align-[-0.2em] text-[#007aff]"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" aria-hidden="true" className="shrink-0 -translate-y-px text-[#25d366]" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.03L2 22l5.1-1.34A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.13 15.08l-.3-.17-3.03.8.81-2.95-.19-.31A8.1 8.1 0 0 1 12.04 3.8zM8.6 7.3c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.63 1.1 2.81c.14.18 1.9 3.04 4.7 4.14 2.32.92 2.8.74 3.3.69.5-.05 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.12-.25-.18-.52-.32-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.5-.84-2.05-.22-.53-.45-.46-.61-.47h-.52z" />
    </svg>
  );
}

/** "הוסיפי את ליקי לטלפון": installs the app on Android when the browser allows it; short steps on iPhone. */
export function InstallAppButton({ className = "", strip = false }: { className?: string; strip?: boolean }) {
  const [platform, setPlatform] = useState<Platform>("hidden");
  const dialog = useRef<HTMLDialogElement>(null);
  const prompt = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    let added = false;
    try {
      added = !!localStorage.getItem(ADDED_KEY);
    } catch {
      // ignore
    }
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    // On Android the browser itself says whether the app is installed: it offers the install only when it is not.
    // On iPhone nothing says so, so "כבר הוספתי" is remembered there.
    if (iOS && added) return;
    if (android && added) {
      try {
        localStorage.removeItem(ADDED_KEY);
      } catch {
        // ignore
      }
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      prompt.current = e as InstallPromptEvent;
    };
    const onInstalled = () => setPlatform("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (iOS) setPlatform("ios");
    else if (android) setPlatform(/SamsungBrowser/i.test(ua) ? "samsung" : "android");
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform === "hidden") return null;

  const openDialog = () => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    // Keep the focus on the window itself so no frame shows around the first link or button.
    d.focus({ preventScroll: true });
  };

  const openInChrome = () => {
    // Opens this same page in Chrome; if Chrome is missing, the phone goes to its page in Google Play.
    const { host, pathname, search } = window.location;
    const play = encodeURIComponent("https://play.google.com/store/apps/details?id=com.android.chrome");
    window.location.href = `intent://${host}${pathname}${search ? `${search}&` : "?"}from=samsung#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${play};end`;
  };

  const click = async () => {
    if (platform === "samsung") {
      openInChrome();
    } else if (platform === "android" && prompt.current) {
      await prompt.current.prompt();
      await prompt.current.userChoice;
      prompt.current = null;
    } else {
      openDialog();
    }
  };

  const alreadyAdded = () => {
    try {
      localStorage.setItem(ADDED_KEY, "1");
    } catch {
      // ignore
    }
    dialog.current?.close();
    setPlatform("hidden");
  };

  const button = (
    <>
      <button
        type="button"
        onClick={click}
        className={`${strip ? "btn-primary cta-pulse font-bold" : "btn-secondary"} inline-flex items-center gap-2 ${className}`}
      >
        <span aria-hidden>📲</span>
        {platform === "samsung" ? "הוסיפי את ליקי לטלפון (בכרום)" : "הוסיפי את ליקי לטלפון"}
      </button>
      <p className="mt-1 text-xs text-ink-soft">
        {platform === "samsung"
          ? "לחוויה הכי טובה, נפתח את ליקי בכרום ושם תוסיפי."
          : "בכמה צעדים פשוטים, כדי שלא תפספסי אף הטבה."}
      </p>
    </>
  );

  return (
    <>
      {strip ? (
        <div className="relative mx-auto mt-6 max-w-3xl rounded-2xl border-2 border-accent/40 bg-accent-soft px-14 py-5 text-center shadow-[var(--shadow-card)]">
          {/* A preview of the icon as it will sit among the phone's apps, at the side. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-maskable-512.png"
            alt=""
            width={48}
            height={48}
            className="absolute right-3 top-3 size-12 rounded-[1.05rem] bg-surface shadow-[var(--shadow-card)] ring-1 ring-black/5"
          />
          <p className="mb-3 whitespace-nowrap font-display text-base font-extrabold leading-tight text-ink sm:text-xl">
            ליקי תמיד איתך, על מסך הבית
          </p>
          {button}
        </div>
      ) : (
        button
      )}

      <dialog
        ref={dialog}
        aria-labelledby="install-title"
        tabIndex={-1}
        autoFocus
        className="m-auto outline-none max-h-[90dvh] w-[min(88vw,24rem)] overflow-y-auto rounded-3xl bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60"
      >
        <h2 id="install-title" className="text-xl font-extrabold">הוספת ליקי למסך הבית</h2>
        {platform === "ios" ? (
          <>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-base">
              <li>
                לוחצות על כפתור השיתוף <ShareIcon /> (ריבוע עם חץ למעלה), או על התפריט ליד שורת הכתובת (שלושה פסים{" "}
                <span aria-hidden>≡</span> או שלוש נקודות <span aria-hidden>⋯</span>) ואז על &quot;שיתוף&quot;.
              </li>
              <li>מחפשות &quot;הוספה למסך הבית&quot;. אם היא לא מופיעה, לוחצות &quot;הצגת עוד&quot; או גוללות למטה.</li>
              <li>לוחצות &quot;הוספה&quot;.</li>
            </ol>
            {siteConfig.community.whatsappUrl && (
            <p className="mt-3 text-sm text-ink-soft">
              לא מצאת?{" "}
              <a href={siteConfig.community.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 align-middle font-bold text-accent underline">
                <WhatsAppIcon />
                כתבי לנו בוואטסאפ
              </a>{" "}
              ונעזור.
            </p>
            )}
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
        <button type="button" onClick={alreadyAdded} className="mt-3 w-full text-center text-sm text-ink-soft underline">
          כבר הוספתי
        </button>
      </dialog>
    </>
  );
}
