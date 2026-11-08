"use client";

import { savePopup, type PopupState } from "@/app/admin/popup-actions";
import { inputClass } from "./styles";
import { useKeepValuesAction } from "./useKeepValuesAction";

interface Values {
  is_active: boolean;
  title: string;
  body: string;
  button_label: string;
  link_url: string;
}

export function PopupForm({ values }: { values: Values }) {
  const { state, pending, onSubmit } = useKeepValuesAction<PopupState>(savePopup, {});
  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="is_active" defaultChecked={values.is_active} className="size-4" />
        הפופאפ פעיל (מוצג בכניסה לאתר)
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">כותרת</span>
        <input name="title" maxLength={80} defaultValue={values.title} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">טקסט</span>
        <textarea name="body" rows={4} maxLength={300} defaultValue={values.body} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">כיתוב הכפתור (לא חובה)</span>
        <input name="button_label" maxLength={40} defaultValue={values.button_label} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">קישור הכפתור, למשל /deals</span>
        <input name="link_url" dir="ltr" maxLength={300} defaultValue={values.link_url} className={inputClass} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
          {pending ? "שומרת…" : "שמירה"}
        </button>
        {state.ok && !pending && (
          <p role="status" className="rounded-xl bg-accent-soft px-3 py-1.5 text-sm font-semibold text-ink">
            ✓ נשמר. השינוי יופיע באתר בתוך דקה.
          </p>
        )}
        {state.error && !pending && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-1.5 text-sm text-danger">{state.error}</p>
        )}
      </div>
    </form>
  );
}
