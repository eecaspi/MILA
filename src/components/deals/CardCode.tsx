"use client";

import Link from "next/link";
import { useActionState } from "react";
import { claimCodeInline, type CardCodeState } from "@/app/(site)/deals/[id]/actions";
import { codeModeNote } from "@/lib/data/mappers";
import { CopyCouponButton } from "./CopyCouponButton";

const messages: Record<NonNullable<CardCodeState["error"]>, string> = {
  limit: "אפשר להחזיק עד 3 קודים ב־24 שעות. נסי שוב כשאחד יפוג.",
  unavailable: "ההטבה הזאת כבר לא זמינה.",
  nocode: "הקוד עוד לא מוכן. נסי שוב בהמשך.",
  failed: "משהו השתבש. נסי שוב.",
  signin: "צריך להתחבר מחדש.",
};

function until(expiresAt: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "numeric",
  }).format(new Date(expiresAt));
}

/**
 * The "get a code" control of an offer card.
 * Visitors: a button to sign up. Members: a button that turns into their personal
 * code, right on the card.
 */
export function CardCode({
  offerId,
  signedIn,
  signupHref,
  initial,
  mode = "personal",
}: {
  offerId: string;
  signedIn: boolean;
  signupHref: string;
  initial?: { code: string; expiresAt: string };
  /** fixed: one code for everyone; personal: made for her; daily: the business's code for today. */
  mode?: "fixed" | "personal" | "daily";
}) {
  const [state, action, pending] = useActionState<CardCodeState, FormData>(
    claimCodeInline,
    initial ? { code: initial.code, expiresAt: initial.expiresAt } : {},
  );

  if (!signedIn) {
    return (
      <div className="space-y-1.5">
        <Link
          href={signupHref}
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-accent bg-white py-2 text-sm font-bold text-accent transition hover:bg-accent-soft sm:py-2.5 sm:text-[15px]"
        >
          הצטרפי וקבלי קוד
        </Link>
        <p className="hidden text-center text-xs text-ink-soft sm:block">
          {codeModeNote[mode]}
        </p>
      </div>
    );
  }

  if (state.code) {
    return (
      <div className="space-y-1.5">
        <CopyCouponButton code={state.code} />
        {state.expiresAt && (
          <p className="text-center text-xs text-ink-soft">
            {mode === "daily" ? "קוד היום" : mode === "fixed" ? "הקוד של העסק" : "אישי וחד־פעמי"}
            {new Date(state.expiresAt).getTime() - Date.now() < 300 * 86_400_000 &&
              ` · תקף עד ${until(state.expiresAt)}`}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-1.5">
      <input type="hidden" name="offer_id" value={offerId} />
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/40 bg-accent-soft/60 px-3 py-2.5 text-sm transition-colors hover:border-accent sm:px-4 sm:py-3 active:scale-[0.99] disabled:opacity-60"
      >
        <span className="w-full text-center font-semibold text-accent">
          {pending ? "יוצרת קוד…" : "לחצי לקבלת קוד קופון"}
        </span>
      </button>
      {state.error ? (
        <p role="alert" className="text-center text-xs text-danger">
          {messages[state.error]}
        </p>
      ) : (
        <p className="hidden text-center text-xs text-ink-soft sm:block">
          {codeModeNote[mode]}
        </p>
      )}
    </form>
  );
}
