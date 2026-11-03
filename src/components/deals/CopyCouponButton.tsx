"use client";

import { useState } from "react";

export function CopyCouponButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the code is still visible to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-gold-soft px-3 py-2 text-sm transition-colors hover:border-gold"
    >
      <span className="ltr font-mono font-bold tracking-wider text-gold">{code}</span>
      <span className="font-semibold text-gold" aria-live="polite">
        {copied ? "הועתק ✓" : "העתקת קוד"}
      </span>
    </button>
  );
}
