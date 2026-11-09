"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateBanner, type BannerState } from "@/app/admin/banner-actions";
import {
  IMAGE_MIME,
  MAX_BANNER_IMAGE_BYTES,
  MAX_BANNER_VIDEO_BYTES,
  VIDEO_MIME,
  type BannerLayout,
  type LinkOption,
} from "@/lib/banners";
import { createClient } from "@/lib/supabase/client";
import { BannerTextFields } from "./BannerTextFields";
import { inputClass } from "./styles";

interface Row {
  id: string;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
  layout: BannerLayout;
  headline: string | null;
  body: string | null;
  button_label: string | null;
}

/** Edits a banner and says clearly whether the save worked. */
export function BannerEditForm({ row, linkOptions }: { row: Row; linkOptions: LinkOption[] }) {
  const router = useRouter();
  const [state, setState] = useState<BannerState>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");
    fd.delete("file");
    setPending(true);
    setState({});
    let uploaded: string | null = null;
    const supabase = createClient();
    if (file instanceof File && file.size > 0) {
      const isImage = IMAGE_MIME.includes(file.type);
      const isVideo = VIDEO_MIME.includes(file.type);
      if (!isImage && !isVideo) {
        setPending(false);
        setState({ error: "אפשר להעלות תמונה (JPG, PNG, WEBP) או סרטון (MP4, WEBM)." });
        return;
      }
      if (isImage && file.size > MAX_BANNER_IMAGE_BYTES) {
        setPending(false);
        setState({ error: "התמונה גדולה מדי (עד 5MB)." });
        return;
      }
      if (isVideo && file.size > MAX_BANNER_VIDEO_BYTES) {
        setPending(false);
        setState({ error: "הסרטון גדול מדי (עד 20MB)." });
        return;
      }
      const ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : file.type.split("/")[1]!.replace("jpeg", "jpg");
      const path = `banners/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setPending(false);
        setState({ error: "ההעלאה נכשלה. בדקי את גודל הקובץ ונסי שוב." });
        return;
      }
      uploaded = path;
      fd.set("new_media_url", supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      fd.set("media_type", isVideo ? "video" : "image");
    }
    const result = await updateBanner({}, fd);
    if (result.error && uploaded) await supabase.storage.from("media").remove([uploaded]);
    setPending(false);
    setState(result);
    if (result.ok && uploaded) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={row.id} />
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">להחלפת התמונה או הסרטון (לא חובה)</span>
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">בוחרים קובץ חדש ולוחצים שמירה. כל שאר ההגדרות נשארות.</span>
      </label>
      <BannerTextFields values={row} linkOptions={linkOptions} />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">סדר</span>
        <input name="sort_order" inputMode="numeric" defaultValue={row.sort_order} className={inputClass} />
      </label>
      <label className="flex items-end gap-2 pb-2 text-sm text-ink">
        <select name="is_published" defaultValue={row.is_published ? "on" : "off"} className={inputClass}>
          <option value="on">מוצג באתר</option>
          <option value="off">מוסתר</option>
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-secondary px-5 py-2 text-sm disabled:opacity-60">
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
