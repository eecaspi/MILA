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
  starts_on: string | null;
  redeem_channel: string | null;
  code_mode: string;
  redeem_url: string | null;
  terms: string | null;
  usage_limit: string | null;
  price_label: string | null;
  highlight: boolean;
  unlisted?: boolean;
  likey_pick_note: string | null;
  status: string;
  is_published: boolean;
  image_url: string | null;
  image_fit?: string | null;
  coupon_code: string | null;
}

export function OfferForm({
  offer,
  businesses,
  dailyUpcoming = [],
}: {
  offer?: OfferFormValues;
  businesses: { id: string; name: string }[];
  /** Daily codes already saved for today and later (admin-only data). */
  dailyUpcoming?: { day: string; code: string }[];
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
        <Field
          label="מתחילה ב (לא חובה)"
          name="starts_on"
          error={e.starts_on}
          hint="אם התאריך עוד לא הגיע, ההטבה תופיע כ'בקרוב' ולא ניתן יהיה לקבל קוד"
        >
          <input
            id="starts_on"
            name="starts_on"
            type="date"
            defaultValue={o?.starts_on ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="איפה מממשים" name="redeem_channel" hint="לא חובה">
          <select
            id="redeem_channel"
            name="redeem_channel"
            defaultValue={o?.redeem_channel ?? ""}
            className={inputClass}
          >
            <option value="">לא צוין</option>
            <option value="online">אונליין</option>
            <option value="store">בחנות בלבד</option>
            <option value="stores">בחנויות בלבד</option>
            <option value="both">אונליין ובחנות</option>
          </select>
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
          hint="בסוג &quot;קוד קבוע&quot;: הקוד של העסק, שכל חברה רשומה מקבלת. בסוג אישי: משמש כתחילית. הקוד לא מוצג לגולשות שלא נרשמו."
        >
          <input
            id="coupon_code"
            name="coupon_code"
            dir="ltr"
            defaultValue={o?.coupon_code ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label="איך מממשים"
          name="code_mode"
          hint="כרגע משתמשים ב״קוד קבוע״: הקוד גם מופיע בהודעת הוואטסאפ לקבוצה. קוד קבוע: קוד אחד של העסק, זהה לכל החברות, בתוקף כל עוד ההטבה בתוקף. אישי: קוד שנוצר לכל חברה ל־24 שעות. יומי: הקוד של העסק לאותו יום. קישור: מעבירה לאתר העסק. בחנות: ממשים בחנות הפיזית, בלי קוד."
        >
          <select id="code_mode" name="code_mode" defaultValue={o?.code_mode ?? "fixed"} className={inputClass}>
            <option value="fixed">קוד קבוע (ברירת מחדל)</option>
            <option value="personal">קוד אישי לכל חברה</option>
            <option value="daily">קוד יומי (זהה לכולן)</option>
            <option value="link">קישור לאתר העסק</option>
            <option value="store">הטבה בחנות פיזית</option>
          </select>
        </Field>
        <Field
          label="קישור למימוש"
          name="redeem_url"
          error={e.redeem_url}
          hint="רק בסוג &quot;קישור&quot;. ריק = האתר של העסק."
        >
          <input id="redeem_url" name="redeem_url" dir="ltr" placeholder="https://..." defaultValue={o?.redeem_url ?? ""} className={inputClass} />
        </Field>
        <Field label="מגבלת שימוש" name="usage_limit" hint="למשל: פעם אחת ללקוחה">
          <input id="usage_limit" name="usage_limit" maxLength={100} defaultValue={o?.usage_limit ?? ""} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="תנאים" name="terms" hint="יוצגו בעמוד ההטבה, למשל: לא כולל מוצרים במבצע">
            <textarea id="terms" name="terms" rows={3} maxLength={600} defaultValue={o?.terms ?? ""} className={inputClass} />
          </Field>
        </div>
        <ImageField
          label="תמונה"
          name="image"
          current={o?.image_url}
          removeName="remove_image"
          error={e.image}
        />
        <Field label="איך התמונה מוצגת בכרטיס" name="image_fit" hint="אם חלק מהתמונה נחתך, אפשר ליישר למעלה או להציג שלמה">
          <select id="image_fit" name="image_fit" defaultValue={o?.image_fit ?? "cover"} className={inputClass}>
            <option value="cover">ממלא את הכרטיס (חותך מהקצוות)</option>
            <option value="top">ממלא, מיושר למעלה (חותך מלמטה)</option>
            <option value="bottom">ממלא, מיושר למטה (חותך מלמעלה)</option>
            <option value="contain">מוצג שלם, בלי חיתוך</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="font-semibold text-ink">קודים יומיים</p>
          <p className="mt-1 text-sm text-ink-soft">
            רק לסוג הקוד &quot;קוד יומי&quot;. הדביקי קוד בכל שורה: הראשון ליום ההתחלה, השני ליום
            שאחריו, וכך הלאה. כדאי לבקש מהעסק להגדיר לכל קוד תוקף ליום אחד בלבד.
          </p>
        </div>
        <Field label="היום הראשון" name="daily_start" error={e.daily_start} hint="ריק = היום">
          <input id="daily_start" name="daily_start" type="date" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="הקודים (שורה לכל יום)" name="daily_codes" error={e.daily_codes}>
            <textarea
              id="daily_codes"
              name="daily_codes"
              rows={5}
              dir="ltr"
              placeholder={"NOA-D1\nNOA-D2\nNOA-D3"}
              className={inputClass}
            />
          </Field>
          <p className="mt-1 text-xs text-ink-soft">
            הדבקה חדשה מחליפה את הקודים מהיום הראשון שבה והלאה.
          </p>
        </div>
        {dailyUpcoming.length > 0 && (
          <p className="text-sm text-ink sm:col-span-2">
            שמורים {dailyUpcoming.length} ימים קדימה, עד {dailyUpcoming[dailyUpcoming.length - 1]!.day}.
            {` הקוד הקרוב: ${dailyUpcoming[0]!.day} · `}
            <span className="ltr font-mono">{dailyUpcoming[0]!.code}</span>
          </p>
        )}
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
          <Check
            name="unlisted"
            label="לקבוצה בלבד: לא מופיע ברשימות, נפתח רק מהקישור (סמני גם ״מפורסם״)"
            defaultChecked={o?.unlisted}
          />
        </div>
      </section>

      <SubmitButton pending={pending}>{o?.id ? "שמירת שינויים" : "הוספת ההטבה"}</SubmitButton>
    </form>
  );
}
