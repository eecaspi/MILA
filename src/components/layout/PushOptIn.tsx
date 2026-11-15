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
    <div
      role="region"
      aria-label="התראות"
      className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-sm rounded-2xl border-2 border-accent/40 bg-surface p-4 text-center shadow-[var(--shadow-card)]"
    >
      <p className="font-display text-lg font-extrabold text-ink">רוצה לדעת כשיש הטבה חדשה?</p>
      <p className="mt-1 text-sm text-ink-soft">נשלח לך התראה קצרה, לא יותר מדי, ואפשר להפסיק בכל רגע.</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button type="button" onClick={enable} disabled={busy} className="btn-primary !px-5 !py-2 text-base font-bold">
          קבלי התראה על הטבות חדשות
        </button>
      </div>
      <button type="button" onClick={dismiss} className="mt-2 text-sm text-ink-soft underline">
        לא תודה
      </button>
    </div>
  );
}
