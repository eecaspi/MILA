"use client";

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="התראות"
        className="w-full max-w-sm rounded-3xl bg-accent p-7 text-center text-on-accent shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <p className="font-display text-2xl font-extrabold">רוצה לדעת כשיש הטבה חדשה?</p>
        <p className="mt-2 text-base opacity-90">ליקי תדאג שתהיי הראשונה לדעת.</p>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="mt-5 w-full rounded-full bg-surface px-5 py-3 text-base font-extrabold text-accent disabled:opacity-60"
        >
          קבלי התראה על הטבות חדשות
        </button>
        <button type="button" onClick={dismiss} className="mt-3 text-sm underline opacity-90">
          לא תודה
        </button>
      </div>
    </div>
  );
}
