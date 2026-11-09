import { BannerUploader } from "@/components/admin/BannerUploader";
import { BannerEditForm } from "@/components/admin/BannerEditForm";
import { pageLinkOptions, type BannerLayout, type LinkOption } from "@/lib/banners";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { deleteBanner } from "../banner-actions";

interface Row {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
  layout: BannerLayout;
  headline: string | null;
  body: string | null;
  button_label: string | null;
  caption_pos: string | null;
  media_scale: number | null;
  mobile_url: string | null;
  mobile_scale: number | null;
}

export default async function AdminBanners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url, sort_order, is_published, layout, headline, body, button_label, caption_pos, media_scale, mobile_url, mobile_scale")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  const { data: offerRows } = await supabase
    .from("offers")
    .select("id, title, businesses!inner(name, is_real_business)")
    .eq("businesses.is_real_business", true)
    .order("title")
    .limit(200);
  const linkOptions: LinkOption[] = [
    ...pageLinkOptions(siteConfig.community.whatsappUrl),
    ...((offerRows ?? []) as unknown as { id: string; title: string; businesses: { name: string } | null }[]).map((o) => ({
      value: `/deals/${o.id}`,
      label: `הטבה: ${o.title}${o.businesses ? ` (${o.businesses.name})` : ""}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink">באנרים בדף הבית</h1>
        <p className="mt-1 text-sm text-ink-soft">
          כל מה שמתחלף בראש דף הבית נמצא כאן, כולל השקופיות של ליקי. אפשר לשנות כותרת, טקסט, כפתור, קישור, סדר (מספר נמוך קודם), להסתיר או למחוק.
        </p>
      </div>

      <BannerUploader linkOptions={linkOptions} />

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
                <BannerEditForm row={b} linkOptions={linkOptions} />
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
