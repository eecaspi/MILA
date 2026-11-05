import { BannerUploader } from "@/components/admin/BannerUploader";
import { inputClass } from "@/components/admin/styles";
import { createClient } from "@/lib/supabase/server";
import { deleteBanner, updateBanner } from "../banner-actions";

interface Row {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
}

export default async function AdminBanners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url, sort_order, is_published")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink">באנרים בדף הבית</h1>
        <p className="mt-1 text-sm text-ink-soft">
          השקופית הראשונה היא תמיד הלוגו של ליקי. אחריה מתחלפים הבאנרים שכאן, לפי הסדר.
        </p>
      </div>

      <BannerUploader />

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          לא הצלחתי לטעון את הבאנרים. ייתכן שצריך להריץ את עדכון מסד הנתונים האחרון.
        </p>
      )}

      {rows.length === 0 && !error ? (
        <p className="text-ink-soft">עוד אין באנרים. הוסיפי את הראשון למעלה.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li
              key={b.id}
              className="grid gap-4 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)] md:grid-cols-[220px_1fr]"
            >
              <div className="overflow-hidden rounded-xl bg-raised">
                {b.media_type === "video" ? (
                  <video src={b.media_url} muted playsInline controls preload="metadata" className="aspect-[16/7] w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.media_url} alt={b.title ?? "באנר"} className="aspect-[16/7] w-full object-cover" />
                )}
              </div>
              <div className="space-y-3">
                <form action={updateBanner} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={b.id} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink-soft">כותרת</span>
                    <input name="title" defaultValue={b.title ?? ""} maxLength={80} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink-soft">קישור</span>
                    <input name="link_url" dir="ltr" defaultValue={b.link_url ?? ""} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink-soft">סדר</span>
                    <input name="sort_order" inputMode="numeric" defaultValue={b.sort_order} className={inputClass} />
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-sm text-ink">
                    <select name="is_published" defaultValue={b.is_published ? "on" : "off"} className={inputClass}>
                      <option value="on">מוצג באתר</option>
                      <option value="off">מוסתר</option>
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <button className="btn-secondary px-5 py-2 text-sm">שמירה</button>
                  </div>
                </form>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-sm font-semibold text-danger hover:underline">מחיקת הבאנר והקובץ</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
