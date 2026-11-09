"use client";

import { useState, type FormEvent } from "react";
import { savePopup, type PopupState } from "@/app/admin/popup-actions";
import { IMAGE_MIME, MAX_BANNER_IMAGE_BYTES, MAX_BANNER_VIDEO_BYTES, VIDEO_MIME } from "@/lib/banners";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "./styles";

interface Values {
  is_active: boolean;
  title: string;
  body: string;
  button_label: string;
  link_url: string;
  image_url: string;
  logo_url: string;
  liky_url: string;
}

export function PopupForm({ values }: { values: Values }) {
  const [state, setState] = useState<PopupState>({});
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState(values.image_url);
  const [logo, setLogo] = useState(values.logo_url);

  const [liky, setLiky] = useState(values.liky_url);

  async function upload(file: File, allowVideo: boolean): Promise<string | { error: string }> {
    const isImage = IMAGE_MIME.includes(file.type);
    const isVideo = allowVideo && VIDEO_MIME.includes(file.type);
    if (!isImage && !isVideo) return { error: allowVideo ? "אפשר להעלות תמונה (JPG, PNG, WEBP) או סרטון (MP4, WEBM)." : "אפשר להעלות תמונה בפורמט JPG, PNG או WEBP." };
    if (isImage && file.size > MAX_BANNER_IMAGE_BYTES) return { error: "התמונה גדולה מדי (עד 5MB)." };
    if (isVideo && file.size > MAX_BANNER_VIDEO_BYTES) return { error: "הסרטון גדול מדי (עד 20MB)." };
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : file.type.split("/")[1]!.replace("jpeg", "jpg");
    const path = `banners/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
    if (error) return { error: "ההעלאה נכשלה. נסי שוב." };
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    const likyFile = fd.get("liky_file");
    const logoFile = fd.get("logo_file");
    fd.delete("logo_file");
    fd.delete("file");
    fd.delete("liky_file");
    setPending(true);
    setState({});
    let url = image;
    let likyUrl = liky;
    let logoUrl = logo;
    if (logoFile instanceof File && logoFile.size > 0) {
      const r = await upload(logoFile, false);
      if (typeof r !== "string") {
        setPending(false);
        setState(r);
        return;
      }
      logoUrl = r;
    }
    if (file instanceof File && file.size > 0) {
      const r = await upload(file, false);
      if (typeof r !== "string") {
        setPending(false);
        setState(r);
        return;
      }
      url = r;
    }
    if (likyFile instanceof File && likyFile.size > 0) {
      const r = await upload(likyFile, true);
      if (typeof r !== "string") {
        setPending(false);
        setState(r);
        return;
      }
      likyUrl = r;
    }
    fd.set("image_url", url);
    fd.set("liky_url", likyUrl);
    fd.set("logo_url", logoUrl);
    const result = await savePopup({}, fd);
    setPending(false);
    setState(result);
    if (result.ok) {
      setImage(url);
      setLiky(likyUrl);
      setLogo(logoUrl);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="is_active" defaultChecked={values.is_active} className="size-4" />
        הפופאפ פעיל (מוצג בכניסה לאתר)
      </label>
      <div className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">לוגו העסק, מופיע למעלה במרכז (לא חובה)</span>
        {logo && (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className="h-24 rounded-xl border border-line object-contain" />
            <button type="button" onClick={() => setLogo("")} className="text-sm font-semibold text-danger">
              הסרת הלוגו
            </button>
          </div>
        )}
        <input type="file" name="logo_file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">כדי להחליף, בחרי קובץ חדש ושמרי. מומלץ לוגו על רקע שקוף או לבן, בגודל 600×300.</span>
      </div>
      <div className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">תמונה קטנה מעל המדיה (לא חובה, אפשר להשאיר ריק)</span>
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
        <span className="mt-1 block text-xs text-ink-soft">כדי להחליף, בחרי קובץ חדש ושמרי.</span>
      </div>
      <div className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">תמונה או סרטון של המבצע, עם ליקי (לא חובה)</span>
        {liky && (
          <div className="mb-2 flex items-center gap-3">
            {/\.(mp4|webm)$/i.test(liky) ? (
              <video src={liky} muted playsInline className="h-24 rounded-xl border border-line object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={liky} alt="" className="h-24 rounded-xl border border-line object-contain" />
            )}
            <button type="button" onClick={() => setLiky("")} className="text-sm font-semibold text-danger">
              חזרה לתמונה הרגילה של ליקי
            </button>
          </div>
        )}
        <input type="file" name="liky_file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">מומלץ יחס 16:10, למשל 1200×750. בלי קובץ מוצגת תמונה רגילה של ליקי. סרטון (עד 20MB) מתנגן בלי קול.</span>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">כותרת המבצע</span>
        <input name="title" maxLength={80} defaultValue={values.title} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">שורה קטנה מעל הכותרת, למשל &quot;הטבה על נעלי ילדים&quot;</span>
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
