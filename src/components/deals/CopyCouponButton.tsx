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
      className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-2xl border-2 border-dashed border-accent/40 bg-accent-soft/60 px-4 py-3 text-sm transition-colors hover:border-accent active:scale-[0.99]"
    >
      <span className="ltr whitespace-nowrap font-mono font-bold tracking-wider text-accent">{code}</span>
      <span className="whitespace-nowrap font-semibold text-accent" aria-live="polite">
        {copied ? "הועתק ✓" : "העתיקי את הקוד"}
      </span>
    </button>
  );
}
