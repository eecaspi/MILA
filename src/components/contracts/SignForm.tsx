"use client";

import { useActionState } from "react";
import { signContract, type SignState } from "@/app/contract/[token]/actions";
import { FIELD_KEYS, FIELD_LABELS } from "@/lib/contracts/template";

const LONG = new Set(["offer", "restrictions", "places", "redemption"]);

export function SignForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [state, action, pending] = useActionState<SignState, FormData>(signContract.bind(null, token), {});
  const input = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base text-ink";
  return (
    <form action={action} className="space-y-5">
      <h2 className="text-lg font-bold text-ink">נספח א&apos;: פרטי העסק וההטבה</h2>
      <div className="space-y-3">
        {FIELD_KEYS.map((key) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">{FIELD_LABELS[key]}</span>
            {LONG.has(key) ? (
              <textarea name={key} rows={2} maxLength={400} required={key !== "restrictions"} className={input} />
            ) : (
              <input
                name={key}
                maxLength={400}
                required
                defaultValue={key === "legalName" ? defaultName : ""}
                dir={key === "contactEmail" || key === "contactPhone" ? "ltr" : undefined}
                type={key === "contactEmail" ? "email" : "text"}
                className={input}
              />
            )}
          </label>
        ))}
      </div>

      <h2 className="text-lg font-bold text-ink">חתימה</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">שם מלא של החותמת/ם</span>
          <input name="signerName" required minLength={2} maxLength={80} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">תפקיד</span>
          <input name="signerRole" maxLength={80} className={input} />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm text-ink">
        <input type="checkbox" name="authority" value="yes" required className="mt-1 accent-[var(--color-accent)]" />
        <span>אני מוסמכת לחתום על ההסכם בשם העסק.</span>
      </label>
      <label className="flex items-start gap-3 text-sm text-ink">
        <input type="checkbox" name="agree" value="yes" required className="mt-1 accent-[var(--color-accent)]" />
        <span>קראתי את ההסכם ואת הנספח, ואני מסכימה לכל האמור בהם. הקלדת השם והלחיצה על &quot;חתימה&quot; מהוות חתימה אלקטרונית על ההסכם.</span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "חותמת..." : "חתימה על ההסכם"}
      </button>
    </form>
  );
}
