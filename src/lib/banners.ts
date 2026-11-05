/** Pure helpers for home banners (checked on the server, tested without a database). */

export type BannerMedia = "image" | "video";
export type BannerLayout = "photo" | "character" | "character_reverse" | "cover";

export const LAYOUTS: { value: BannerLayout; label: string }[] = [
  { value: "photo", label: "תמונה או סרטון (עם כותרת וכפתור)" },
  { value: "character", label: "תמונה בצד, כותרת וטקסט בצד" },
  { value: "character_reverse", label: "תמונה בצד השני, כותרת וטקסט" },
  { value: "cover", label: "תמונה עיצובית על כל הבאנר + כפתור" },
];

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const VIDEO_MIME = ["video/mp4", "video/webm"];
export const MAX_BANNER_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_BANNER_VIDEO_BYTES = 20 * 1024 * 1024;

export interface BannerValues {
  media_url: string;
  media_type: BannerMedia;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
  layout: BannerLayout;
  headline: string | null;
  body: string | null;
  button_label: string | null;
}

export type BannerParse =
  | { ok: true; values: BannerValues }
  | { ok: false; errors: Record<string, string> };

/** Public URL prefix of banner files in our own media bucket. */
export function bannerPrefix(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/media/banners/`;
}

/** The storage path ("banners/xyz.jpg") of one of our banner URLs, or null for anything else. */
export function bannerStoragePath(url: string, supabaseUrl: string): string | null {
  const prefix = bannerPrefix(supabaseUrl);
  return url.startsWith(prefix) ? `banners/${url.slice(prefix.length)}` : null;
}

/** Our own uploads, or one of the brand pictures shipped with the site. */
export function isAllowedMedia(url: string, supabaseUrl: string): boolean {
  if (url.includes("..")) return false;
  return !!bannerStoragePath(url, supabaseUrl) || /^\/brand\/[\w.-]+$/.test(url);
}

/** A link target must stay on the site ("/deals") or be an https address. */
export function safeLink(raw: string): string | null | undefined {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//") && !/\s/.test(v)) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname.includes(".") ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function field(fd: FormData, name: string, max: number): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function parseBannerForm(fd: FormData, supabaseUrl: string): BannerParse {
  const errors: Record<string, string> = {};
  const media_url = field(fd, "media_url", 600);
  if (!media_url || !isAllowedMedia(media_url, supabaseUrl)) {
    errors.media = "לא הועלה קובץ";
  }
  const type = field(fd, "media_type", 10);
  if (type !== "image" && type !== "video") errors.media = "סוג הקובץ לא נתמך";
  const layoutRaw = field(fd, "layout", 20) || "photo";
  if (!LAYOUTS.some((l) => l.value === layoutRaw)) errors.layout = "סוג תצוגה לא מוכר";
  const link = safeLink(field(fd, "link_url", 300));
  if (link === undefined) errors.link_url = "הקישור צריך להתחיל ב־/ (עמוד באתר) או ב־https://";
  const sortRaw = field(fd, "sort_order", 6);
  const sort = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isInteger(sort) || sort < -999 || sort > 999) errors.sort_order = "מספר שלם בין -999 ל־999";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    values: {
      media_url,
      media_type: type as BannerMedia,
      title: field(fd, "title", 80) || null,
      link_url: link ?? null,
      sort_order: sort,
      is_published: fd.get("is_published") !== "off",
      layout: layoutRaw as BannerLayout,
      headline: field(fd, "headline", 80) || null,
      body: field(fd, "body", 160) || null,
      button_label: field(fd, "button_label", 30) || null,
    },
  };
}
