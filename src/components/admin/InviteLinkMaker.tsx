"use client";

import { useState } from "react";

const GENERAL_LINK = "https://liky.club/?invite=1";

function linkFor(name: string) {
  return `https://liky.club/?for=${encodeURIComponent(name)}`;
}

export function InviteLinkMaker() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const names = Array.from(
    new Set(
      text
        .split("\n")
        .map((n) => n.replace(/[<>]/g, "").trim().slice(0, 40))
        .filter(Boolean),
    ),
  );

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-xl border border-line bg-raised p-3">
        <p className="font-semibold text-ink">קישור כללי, בלי שם</p>
        <p className="mt-1 text-sm text-ink-soft">לשליחה למי שלא בטוחות שירצו להשתתף. מציג את ההודעה בלי להזכיר שם.</p>
        <p dir="ltr" className="mt-1 break-all text-sm text-ink-soft">
          {GENERAL_LINK}
        </p>
        <button type="button" onClick={() => copy("general", GENERAL_LINK)} className="btn-primary mt-2 !px-4 !py-1.5 text-sm">
          {copied === "general" ? "הועתק ✓" : "העתקת הקישור הכללי"}
        </button>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-soft">שמות הלקוחות או העסקים, שם בכל שורה (יופיעו בברכת הקבלה)</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3"
          placeholder={"נעלי שמחה\nחנות הפלא\nבוטיק מרים"}
        />
      </label>
      {names.length > 0 && (
        <ul className="space-y-2">
          {names.map((n) => (
            <li key={n} className="rounded-xl border border-line bg-raised p-3">
              <p className="font-semibold text-ink">{n}</p>
              <p dir="ltr" className="mt-1 break-all text-sm text-ink-soft">
                {linkFor(n)}
              </p>
              <button type="button" onClick={() => copy(n, linkFor(n))} className="btn-primary mt-2 !px-4 !py-1.5 text-sm">
                {copied === n ? "הועתק ✓" : "העתקת הקישור"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {names.length > 1 && (
        <button
          type="button"
          onClick={() => copy("all", names.map((n) => `${n}: ${linkFor(n)}`).join("\n"))}
          className="btn-secondary"
        >
          {copied === "all" ? "הועתק ✓" : "העתקת כל הקישורים עם השמות"}
        </button>
      )}
    </div>
  );
}
