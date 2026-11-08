"use client";

import { updateBanner, type BannerState } from "@/app/admin/banner-actions";
import type { BannerLayout, LinkOption } from "@/lib/banners";
import { BannerTextFields } from "./BannerTextFields";
import { inputClass } from "./styles";
import { useKeepValuesAction } from "./useKeepValuesAction";

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
  const { state, pending, onSubmit } = useKeepValuesAction<BannerState>(updateBanner, {});
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={row.id} />
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
