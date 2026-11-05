"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createBanner } from "@/app/admin/banner-actions";
import {
  IMAGE_MIME,
  MAX_BANNER_IMAGE_BYTES,
  MAX_BANNER_VIDEO_BYTES,
  VIDEO_MIME,
} from "@/lib/banners";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "./styles";

/**
 * Adds a banner. The file goes from the browser straight to storage (a video can be large),
 * then the banner row is saved by a server action that re-checks everything.
 */
export function BannerUploader() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ tone: "error", text: "צריך לבחור תמונה או סרטון." });
      return;
    }
    const isImage = IMAGE_MIME.includes(file.type);
    const isVideo = VIDEO_MIME.includes(file.type);
    if (!isImage && !isVideo) {
      setMessage({ tone: "error", text: "אפשר להעלות תמונה (JPG, PNG, WEBP) או סרטון (MP4, WEBM)." });
      return;
    }
    if (isImage && file.size > MAX_BANNER_IMAGE_BYTES) {
      setMessage({ tone: "error", text: "התמונה גדולה מדי (עד 5MB)." });
      return;
    }
    if (isVideo && file.size > MAX_BANNER_VIDEO_BYTES) {
      setMessage({ tone: "error", text: "הסרטון גדול מדי (עד 20MB). אפשר לדחוס אותו או לקצר." });
      return;
    }

    setBusy(true);
    setMessage(null);
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : file.type.split("/")[1]!.replace("jpeg", "jpg");
    const path = `banners/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setBusy(false);
      setMessage({ tone: "error", text: "ההעלאה נכשלה. בדקי את גודל הקובץ ונסי שוב." });
      return;
    }
    const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    const data = new FormData();
    data.set("media_url", url);
    data.set("media_type", isVideo ? "video" : "image");
    data.set("title", String(fd.get("title") ?? ""));
    data.set("link_url", String(fd.get("link_url") ?? ""));
    data.set("sort_order", String(fd.get("sort_order") ?? ""));
    const result = await createBanner(data);
    setBusy(false);
    if (result.error) {
      await supabase.storage.from("media").remove([path]);
      setMessage({ tone: "error", text: result.error });
      return;
    }
    form.reset();
    setMessage({ tone: "ok", text: "הבאנר נוסף והוא כבר מופיע בראש דף הבית." });
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="grid gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2"
    >
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-sm font-semibold text-ink">תמונה או סרטון</span>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-soft">
          תמונה רחבה (למשל 1600×700) עד 5MB, או סרטון קצר MP4 / WEBM עד 20MB. הסרטון מתנגן בלי קול.
        </span>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">כותרת על הבאנר (לא חובה)</span>
        <input name="title" maxLength={80} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">קישור בלחיצה (לא חובה)</span>
        <input name="link_url" dir="ltr" placeholder="/deals או https://..." className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink">סדר (מספר נמוך קודם, הדמות של ליקי: 0)</span>
        <input name="sort_order" inputMode="numeric" placeholder="0" className={inputClass} />
      </label>
      <div className="flex items-end">
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "מעלה…" : "הוספת באנר"}
        </button>
      </div>
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`sm:col-span-2 rounded-xl px-3 py-2 text-sm ${message.tone === "error" ? "bg-danger/10 text-danger" : "bg-accent-soft text-ink"}`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
