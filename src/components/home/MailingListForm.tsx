"use client";

import Link from "next/link";
import { useActionState } from "react";
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
        תודה! נרשמת לדיוור של ליקי.
      </p>
    );
  }

  return (
    <form action={action} className="mx-auto w-full max-w-xl space-y-2 text-start">
      <p className="text-center text-sm font-bold text-ink">אפשר גם לקבל הטבות למייל</p>
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
          אני מאשרת קבלת דיוור והטבות במייל מליקי, ואפשר להסיר את עצמי בכל עת. פרטים ב
          <Link href="/privacy" className="font-semibold text-accent underline">מדיניות הפרטיות</Link>.
        </span>
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold text-danger">{state.message}</p>
      )}
      <button disabled={pending} className="btn-secondary w-full !py-2 text-sm disabled:opacity-60">
        {pending ? "רגע…" : "הצטרפות לדיוור במייל"}
      </button>
    </form>
  );
}
