"use client";

import { saveOffer, type FormState } from "@/app/admin/content-actions";
import { useKeepValuesAction } from "./useKeepValuesAction";
import { Alert } from "@/components/ui/Alert";
import { Check, Field, ImageField, SubmitButton, inputClass } from "./FormBits";

export interface OfferFormValues {
  id?: string;
  business_id: string;
  kind: string;
  title: string;
  value_label: string;
  description: string;
  valid_until: string | null;
  price_label: string | null;
  highlight: boolean;
  likey_pick_note: string | null;
  status: string;
  is_published: boolean;
  image_url: string | null;
  coupon_code: string | null;
}

export function OfferForm({
  offer,
  businesses,
}: {
  offer?: OfferFormValues;
  businesses: { id: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useKeepValuesAction<FormState>(saveOffer, {});
  const e = state.errors ?? {};
  const o = offer;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {o?.id && <input type="hidden" name="id" value={o.id} />}
      {state.message && <Alert tone="error">{state.message}</Alert>}
      {Object.keys(e).length > 0 && <Alert tone="error">יש שדות שצריך לתקן (מסומנים למטה).</Alert>}

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <Field label="עסק *" name="business_id" error={e.business_id}>
          <select
            id="business_id"
            name="business_id"
            defaultValue={o?.business_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              בחרי עסק
            </option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="סוג" name="kind">
          <select id="kind" name="kind" defaultValue={o?.kind ?? "deal"} className={inputClass}>
            <option value="deal">מבצע</option>
            <option value="coupon">קופון</option>
          </select>
        </Field>
        <Field label="כותרת *" name="title" error={e.title}>
          <input id="title" name="title" defaultValue={o?.title} className={inputClass} />
        </Field>
        <Field
          label="ההטבה *"
          name="value_label"
          error={e.value_label}
          hint="מה שמופיע בגדול, למשל: 20% הנחה"
        >
          <input
            id="value_label"
            name="value_label"
            defaultValue={o?.value_label}
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="תיאור" name="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={o?.description}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="בתוקף עד" name="valid_until" error={e.valid_until}>
          <input
            id="valid_until"
            name="valid_until"
            type="date"
            defaultValue={o?.valid_until ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="מחיר (לא חובה)" name="price_label" hint="רק מחיר שהעסק אישר">
          <input
            id="price_label"
            name="price_label"
            defaultValue={o?.price_label ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label="קוד קופון"
          name="coupon_code"
          error={e.coupon_code}
          hint="נשמר במערכת בלבד. כרגע האתר במצב תדמיתי והקוד לא מוצג לגולשות."
        >
          <input
            id="coupon_code"
            name="coupon_code"
            dir="ltr"
            defaultValue={o?.coupon_code ?? ""}
            className={inputClass}
          />
        </Field>
        <ImageField
          label="תמונה"
          name="image"
          current={o?.image_url}
          removeName="remove_image"
          error={e.image}
        />
      </section>

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="ליקי ממליצה (לא חובה)"
            name="likey_pick_note"
            hint="משפט קצר: למה בחרנו בהטבה. מופיע ב'הבחירות של ליקי'"
          >
            <input
              id="likey_pick_note"
              name="likey_pick_note"
              defaultValue={o?.likey_pick_note ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="סטטוס" name="status">
          <select
            id="status"
            name="status"
            defaultValue={o?.status === "verified" ? "verified" : "listed"}
            className={inputClass}
          >
            <option value="listed">ברשימה</option>
            <option value="verified">מאומת</option>
          </select>
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-1">
          <Check name="highlight" label="להבליט בעמוד הבית" defaultChecked={o?.highlight} />
          <Check name="is_published" label="מפורסם באתר" defaultChecked={o?.is_published} />
        </div>
      </section>

      <SubmitButton pending={pending}>{o?.id ? "שמירת שינויים" : "הוספת ההטבה"}</SubmitButton>
    </form>
  );
}
