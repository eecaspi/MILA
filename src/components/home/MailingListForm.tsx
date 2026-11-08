"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { joinMailingList, type MailingState } from "./mailing-actions";

const initial: MailingState = { status: "idle" };
const field =
  "w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none";

/** Name + email + consent: the visitor joins the email list; the admin sees it in the dashboard. */
export function MailingListForm() {
  const [state, action, pending] = useActionState(joinMailingList, initial);

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-2xl bg-surface px-4 py-3 text-center font-bold text-ink">
        תודה! הצטרפת לקהילה של ליקי במייל.
      </p>
    );
  }

  return (
    <form action={action} className="mx-auto w-full max-w-xl space-y-2 text-start">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="name" required maxLength={80} autoComplete="name" placeholder="שם" aria-label="שם" className={field} />
        <input
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          placeholder="כתובת מייל"
          aria-label="כתובת מייל"
          className={`${field} text-end`}
        />
      </div>
      <input name="website_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-4 accent-[var(--color-accent)]" />
        <span>
          אני מאשרת הצטרפות לקהילה של ליקי במייל וקבלת דיוור והטבות במייל, ואפשר להסיר את עצמי בכל עת. פרטים ב
          <Link href="/privacy" className="font-semibold text-accent underline">מדיניות הפרטיות</Link>.
        </span>
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold text-danger">{state.message}</p>
      )}
      <button disabled={pending} className="btn-secondary w-full !py-2 text-sm disabled:opacity-60">
        {pending ? "רגע…" : "הצטרפות לקהילה במייל"}
      </button>
    </form>
  );
}

/** A button beside the WhatsApp one; the form opens in a small dialog. */
export function MailingListButton() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="btn-secondary !px-5 !py-2 text-sm sm:!px-7 sm:!py-3 sm:text-base"
      >
        הצטרפי לקהילה במייל
      </button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(92vw,30rem)] rounded-[var(--radius-card)] bg-surface p-5 text-ink shadow-[var(--shadow-card)] backdrop:bg-black/40"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">הצטרפות לקהילה של ליקי במייל</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="סגירה" className="size-8 rounded-full text-xl text-ink-soft">
            ×
          </button>
        </div>
        <p className="mb-3 text-sm text-ink-soft">
          חברות בקהילה במייל מקבלות הטבות חדשות ישר לתיבת המייל, בלי ספאם.
        </p>
        <MailingListForm />
      </dialog>
    </>
  );
}
