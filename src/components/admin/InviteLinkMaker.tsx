"use client";

import { useState, useTransition } from "react";
import { addInvites, deleteInvite } from "@/app/admin/invite-actions";

const GENERAL_LINK = "https://liky.club/?invite=1";

function linkFor(name: string) {
  return `https://liky.club/?for=${encodeURIComponent(name)}`;
}

export function InviteLinkMaker({ saved }: { saved: { id: string; name: string }[] }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await addInvites(text.split("\n"));
      if (res.error) setError(res.error);
      else setText("");
    });
  }

  function remove(id: string) {
    setError(null);
    start(async () => {
      const res = await deleteInvite(id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
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

      <div className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-soft">הוספת לקוחות או עסקים, שם בכל שורה (יופיעו בברכת הקבלה)</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3"
            placeholder={"נעלי שמחה\nחנות הפלא\nבוטיק מרים"}
          />
        </label>
        <button type="button" onClick={save} disabled={pending || !text.trim()} className="btn-primary disabled:opacity-50">
          {pending ? "שומרת…" : "שמירה"}
        </button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>

      <div>
        <h2 className="mb-2 text-lg text-ink">הלקוחות השמורים ({saved.length})</h2>
        {saved.length === 0 ? (
          <p className="text-ink-soft">עדיין לא נשמרו לקוחות.</p>
        ) : (
          <ul className="space-y-2">
            {saved.map((s) => (
              <li key={s.id} className="rounded-xl border border-line bg-raised p-3">
                <p className="font-semibold text-ink">{s.name}</p>
                <p dir="ltr" className="mt-1 break-all text-sm text-ink-soft">
                  {linkFor(s.name)}
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => copy(s.id, linkFor(s.name))} className="btn-primary !px-4 !py-1.5 text-sm">
                    {copied === s.id ? "הועתק ✓" : "העתקת הקישור"}
                  </button>
                  <button type="button" onClick={() => remove(s.id)} disabled={pending} className="btn-secondary !px-4 !py-1.5 text-sm">
                    מחיקה
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {saved.length > 1 && (
          <button
            type="button"
            onClick={() => copy("all", saved.map((s) => `${s.name}: ${linkFor(s.name)}`).join("\n"))}
            className="btn-secondary mt-3"
          >
            {copied === "all" ? "הועתק ✓" : "העתקת כל הקישורים עם השמות"}
          </button>
        )}
      </div>
    </div>
  );
}
