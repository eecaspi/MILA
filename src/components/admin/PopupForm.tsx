"use client";

import { useState, type FormEvent } from "react";
import { savePopup, type PopupState } from "@/app/admin/popup-actions";
import { IMAGE_MIME, MAX_BANNER_IMAGE_BYTES } from "@/lib/banners";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "./styles";

interface Values {
  is_active: boolean;
  title: string;
  body: string;
  button_label: string;
  link_url: string;
  image_url: string;
}

export function PopupForm({ values }: { values: Values }) {
  const [state, setState] = useState<PopupState>({});
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState(values.image_url);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    setPending(true);
    setState({});
    let url = image;
    if (file instanceof File && file.size > 0) {
      if (!IMAGE_MIME.includes(file.type)) {
        setPending(false);
        setState({ error: "אפשר להעלות תמונה בפורמט JPG, PNG או WEBP." });
        return;
      }
      if (file.size > MAX_BANNER_IMAGE_BYTES) {
        setPending(false);
        setState({ error: "התמונה גדולה מדי (עד 5MB)." });
        return;
      }
      const ext = file.type.split("/")[1]!.replace("jpeg", "jpg");
      const path = `banners/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
      if (error) {
        setPending(false);
        setState({ error: "ההעלאה נכשלה. נסי שוב." });
        return;
      }
      url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    }
    fd.delete("file");
    fd.set("image_url", url);
    const result = await savePopup({}, fd);
    setPending(false);
    setState(result);
    if (result.ok) setImage(url);
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="is_active" defaultChecked={values.is_active} className="size-4" />
        הפופאפ פעיל (מוצג בכניסה לאתר)
      </label>
      <div className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">תמונה (לא חובה)</span>
        {image && (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-24 rounded-xl border border-line object-contain" />
            <button type="button" onClick={() => setImage("")} className="text-sm font-semibold text-danger">
              הסרת התמונה
            </button>
          </div>
        )}
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">
          כדי להחליף, בחרי קובץ חדש ושמרי. תמונה מרובעת או לאורך מתאימה הכי טוב.
        </span>
      </div>
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
        <span className="mb-1 block text-xs font-semibold text-ink-soft">קישור הכפתור (לא חובה, בלי קישור הכפתור רק סוגר), למשל /deals</span>
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
