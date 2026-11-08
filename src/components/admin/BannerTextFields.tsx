import { useId } from "react";
import { CAPTION_SIDES, CAPTION_VERTS, LAYOUTS, toCaptionPos, type BannerLayout, type LinkOption } from "@/lib/banners";
import { inputClass } from "./styles";

/** The fields every banner has: how it looks, what it says, the button and where it leads. */
export function BannerTextFields({
  values,
  linkOptions,
}: {
  linkOptions: LinkOption[];
  values?: {
    layout: BannerLayout;
    title: string | null;
    headline: string | null;
    body: string | null;
    button_label: string | null;
    link_url: string | null;
    caption_pos?: string | null;
  };
}) {
  const listId = useId();
  const [side, vert] = toCaptionPos(values?.caption_pos).split("-");
  return (
    <>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">איך הבאנר נראה</span>
        <select name="layout" defaultValue={values?.layout ?? "photo"} className={inputClass}>
          {LAYOUTS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">כותרת גדולה</span>
        <input name="headline" defaultValue={values?.headline ?? ""} maxLength={80} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">טקסט קצר</span>
        <input name="body" defaultValue={values?.body ?? ""} maxLength={160} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">כיתוב הכפתור</span>
        <input
          name="button_label"
          defaultValue={values?.button_label ?? ""}
          maxLength={30}
          placeholder="לפרטים נוספים"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">קישור בלחיצה</span>
        <input
          name="link_url"
          dir="ltr"
          defaultValue={values?.link_url ?? ""}
          placeholder="בחרי מהרשימה או הדביקי כתובת"
          list={listId}
          autoComplete="off"
          className={inputClass}
        />
        <datalist id={listId}>
          {linkOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </datalist>
        <span className="mt-1 block text-xs text-ink-soft">
          לחיצה בשדה פותחת רשימה של עמודי האתר וההטבות. אפשר גם להדביק כתובת שמתחילה ב־https.
        </span>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">מיקום הכיתוב והכפתור: צד</span>
        <select name="caption_side" defaultValue={side} className={inputClass}>
          {CAPTION_SIDES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">גובה</span>
        <select name="caption_vert" defaultValue={vert} className={inputClass}>
          {CAPTION_VERTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">
          כותרת קטנה (בתצוגת תמונה: מופיעה על התמונה. בשאר: תיאור לקורא מסך)
        </span>
        <input name="title" defaultValue={values?.title ?? ""} maxLength={80} className={inputClass} />
      </label>
    </>
  );
}
