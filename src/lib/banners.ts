/** Pure helpers for home banners (checked on the server, tested without a database). */

export type BannerMedia = "image" | "video";

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
  if (!media_url || !bannerStoragePath(media_url, supabaseUrl) || media_url.includes("..")) {
    errors.media = "לא הועלה קובץ";
  }
  const type = field(fd, "media_type", 10);
  if (type !== "image" && type !== "video") errors.media = "סוג הקובץ לא נתמך";
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
    },
  };
}
