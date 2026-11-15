"use client";

import { useActionState } from "react";
import { sendNotification, type PushSendResult } from "@/app/admin/push-actions";

export function PushSendForm({ shabbat }: { shabbat: boolean }) {
  const [state, action, pending] = useActionState<PushSendResult, FormData>(sendNotification, {});
  return (
    <form action={action} className="max-w-xl space-y-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">כותרת (עד 60 תווים)</span>
        <input name="title" maxLength={60} required placeholder="הטבה חדשה בליקי" className="w-full rounded-xl border border-line bg-surface px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">תוכן (עד 160 תווים)</span>
        <textarea name="body" maxLength={160} required rows={3} placeholder="20% הנחה אצל…" className="w-full rounded-xl border border-line bg-surface px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">לאן להגיע בלחיצה</span>
        <input name="url" defaultValue="/deals" dir="ltr" className="w-full rounded-xl border border-line bg-surface px-3 py-2" />
        <span className="mt-1 block text-xs text-ink-soft">עמוד באתר, למשל /deals, או קישור שמתחיל ב-https.</span>
      </label>
      {shabbat && (
        <label className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold text-ink">
          <input type="checkbox" name="confirmShabbat" />
          עכשיו שבת. אני יודעת, ובכל זאת לשלוח.
        </label>
      )}
      <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2.5 font-bold">
        {pending ? "שולחת…" : "שלחי התראה לכולן"}
      </button>
      {state.error && <p role="alert" className="text-sm font-semibold text-accent">{state.error}</p>}
      {state.sent !== undefined && (
        <p role="status" className="text-sm font-semibold text-ink">
          נשלח ל-{state.sent} מכשירים.{state.removed ? ` הוסרו ${state.removed} שבוטלו.` : ""}
          {state.failed ? ` ${state.failed} נכשלו.` : ""}
        </p>
      )}
    </form>
  );
}
