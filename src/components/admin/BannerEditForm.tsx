"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateBanner, type BannerState } from "@/app/admin/banner-actions";
import { uploadBannerFile, removeUploaded } from "@/lib/banner-upload";
import type { BannerLayout, LinkOption } from "@/lib/banners";
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
  caption_pos?: string | null;
  media_scale?: number | null;
  mobile_url?: string | null;
  mobile_scale?: number | null;
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
    setPending(true);
    setState({});
    const uploaded: string[] = [];
    const file = fd.get("file");
    const mobileFile = fd.get("mobile_file");
    fd.delete("file");
    fd.delete("mobile_file");
    for (const [f, key, typeKey] of [
      [file, "new_media_url", "media_type"],
      [mobileFile, "new_mobile_url", null],
    ] as const) {
      if (!(f instanceof File) || f.size === 0) continue;
      const r = await uploadBannerFile(f);
      if ("error" in r) {
        await Promise.all(uploaded.map(removeUploaded));
        setPending(false);
        setState({ error: r.error });
        return;
      }
      uploaded.push(r.path);
      fd.set(key, r.url);
      if (typeKey) fd.set(typeKey, r.type);
    }
    const result = await updateBanner({}, fd);
    if (result.error) await Promise.all(uploaded.map(removeUploaded));
    setPending(false);
    setState(result);
    if (result.ok && uploaded.length) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={row.id} />
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">להחלפת התמונה או הסרטון של המחשב (לא חובה)</span>
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">בוחרים קובץ חדש ולוחצים שמירה. כל שאר ההגדרות נשארות.</span>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-ink-soft">
          תמונה או סרטון לפלאפון (לא חובה){row.mobile_url ? " — כבר הועלה קובץ לפלאפון, בחירת קובץ חדש תחליף אותו" : ""}
        </span>
        <input type="file" name="mobile_file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" className={inputClass} />
        <span className="mt-1 block text-xs text-ink-soft">
          בלי קובץ לפלאפון, אותו קובץ מוצג בשני המכשירים. מומלץ לפלאפון תמונה ביחס 2:1 או מרובעת יותר.
        </span>
        {row.mobile_url && (
          <label className="mt-1 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="remove_mobile" value="1" />
            הסרת הקובץ של הפלאפון (חזרה לאותו קובץ כמו במחשב)
          </label>
        )}
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
