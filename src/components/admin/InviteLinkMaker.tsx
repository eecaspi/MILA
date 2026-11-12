"use client";

import { useState } from "react";

export function InviteLinkMaker() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const clean = name.replace(/[<>]/g, "").trim().slice(0, 40);
  const link = clean ? `https://liky.club/?for=${encodeURIComponent(clean)}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-soft">שם הלקוח או העסק (יופיע בברכת הקבלה)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3"
          placeholder="למשל: נעלי שמחה"
        />
      </label>
      {link && (
        <div className="space-y-2">
          <p dir="ltr" className="break-all rounded-xl border border-line bg-raised p-3 text-sm">
            {link}
          </p>
          <button type="button" onClick={copy} className="btn-primary">
            {copied ? "הועתק ✓" : "העתקת הקישור"}
          </button>
        </div>
      )}
    </div>
  );
}
