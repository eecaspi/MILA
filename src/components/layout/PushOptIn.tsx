"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "liky-push-dismissed";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Offered only inside the installed app (opened from the home-screen icon): on iPhone that is the
 * only place notifications work. "לא תודה" hides it for good on this device.
 */
export function PushOptIn() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!PUBLIC_KEY) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // ignore
    }
    if (Notification.permission === "default") setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return dismiss();
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY) }));
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60 p-6 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="התראות"
        className="relative mt-16 w-full max-w-sm rounded-[2rem] bg-gradient-to-b from-accent to-accent-bright px-6 pb-6 pt-24 text-center text-on-accent shadow-[0_24px_70px_rgba(0,0,0,0.55)] ring-4 ring-white/70"
      >
        <div className="absolute -top-20 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-surface p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-4 ring-accent">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image src="/brand/liky-phone.webp" alt="" fill sizes="9rem" unoptimized className="object-contain object-bottom" />
          </div>
        </div>
        <p className="font-display text-2xl font-extrabold leading-tight">רוצה לדעת כשיש הטבה חדשה?</p>
        <p className="mx-auto mt-2 max-w-[16rem] text-base leading-snug text-on-accent/90">ליקי תדאג שתהיי הראשונה לדעת.</p>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-surface px-5 py-3.5 text-base font-extrabold text-accent shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition active:scale-[0.98] disabled:opacity-60"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          קבלי התראה על הטבות חדשות
        </button>
        <button type="button" onClick={dismiss} className="mt-4 text-sm text-on-accent/85 underline underline-offset-4">
          לא תודה
        </button>
      </div>
    </div>
  );
}
