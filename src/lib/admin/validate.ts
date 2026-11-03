/**
 * Back-office form validation. Pure: takes FormData, returns clean values for the
 * database or Hebrew error messages per field. The database checks again.
 */
import { isCategorySlug } from "../../data/categories.ts";

export type FieldErrors = Record<string, string>;
export type Parsed<T> = { ok: true; values: T } | { ok: false; errors: FieldErrors };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function text(fd: FormData, name: string, max: number): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
const orNull = (s: string) => (s ? s : null);

function url(fd: FormData, name: string, errors: FieldErrors): string | null {
  const v = text(fd, name, 300);
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes(".")) throw new Error("no tld");
    return u.toString();
  } catch {
    errors[name] = "כתובת האתר לא תקינה";
    return null;
  }
}

/** Optional uploaded image: null when no file was chosen. */
export function imageFile(fd: FormData, name: string, errors: FieldErrors): File | null {
  const f = fd.get(name);
  if (!f || typeof f === "string" || f.size === 0) return null;
  if (!IMAGE_TYPES.includes(f.type)) {
    errors[name] = "אפשר להעלות רק תמונה (JPG, PNG, WEBP)";
    return null;
  }
  if (f.size > MAX_IMAGE_BYTES) {
    errors[name] = "התמונה גדולה מדי (עד 5MB)";
    return null;
  }
  return f;
}

export interface BusinessValues {
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  area: string;
  city: string | null;
  website: string | null;
  phone: string | null;
  tags: string[];
  status: "listed" | "verified";
  is_published: boolean;
  sort_order: number;
}

export function parseBusinessForm(fd: FormData): Parsed<BusinessValues> {
  const errors: FieldErrors = {};
  const name = text(fd, "name", 120);
  if (name.length < 2) errors.name = "צריך שם עסק (לפחות 2 תווים)";
  const category = text(fd, "category_slug", 40);
  if (!isCategorySlug(category)) errors.category_slug = "צריך לבחור קטגוריה";
  const short = text(fd, "short_description", 200);
  if (short.length < 5) errors.short_description = "צריך תיאור קצר (לפחות 5 תווים)";
  const phone = text(fd, "phone", 30);
  if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) errors.phone = "מספר הטלפון לא תקין";
  const status = text(fd, "status", 20) === "verified" ? "verified" : "listed";
  const sort = Number.parseInt(text(fd, "sort_order", 6) || "0", 10);
  const website = url(fd, "website", errors);

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    values: {
      name,
      category_slug: category,
      short_description: short,
      description: text(fd, "description", 2000),
      area: text(fd, "area", 80),
      city: orNull(text(fd, "city", 60)),
      website,
      phone: orNull(phone),
      tags: text(fd, "tags", 300)
        .split(/[,،]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
      status,
      is_published: fd.get("is_published") === "on",
      sort_order: Number.isFinite(sort) ? Math.max(-999, Math.min(999, sort)) : 0,
    },
  };
}

export interface OfferValues {
  business_id: string;
  kind: "deal" | "coupon";
  title: string;
  value_label: string;
  description: string;
  valid_until: string | null;
  price_label: string | null;
  highlight: boolean;
  likey_pick_note: string | null;
  status: "listed" | "verified";
  is_published: boolean;
  coupon_code: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseOfferForm(fd: FormData): Parsed<OfferValues> {
  const errors: FieldErrors = {};
  const business = text(fd, "business_id", 40);
  if (!UUID.test(business)) errors.business_id = "צריך לבחור עסק";
  const title = text(fd, "title", 160);
  if (title.length < 2) errors.title = "צריך כותרת להטבה";
  const value = text(fd, "value_label", 60);
  if (!value) errors.value_label = "צריך לכתוב מה ההטבה, למשל 20% הנחה";
  const until = text(fd, "valid_until", 10);
  if (until && (!/^\d{4}-\d{2}-\d{2}$/.test(until) || Number.isNaN(Date.parse(until)))) {
    errors.valid_until = "תאריך לא תקין";
  }
  const code = text(fd, "coupon_code", 60);
  if (code && !/^[A-Za-z0-9_\-]{2,60}$/.test(code))
    errors.coupon_code = "קוד קופון: אותיות באנגלית, ספרות ומקף בלבד";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    values: {
      business_id: business,
      kind: text(fd, "kind", 10) === "coupon" ? "coupon" : "deal",
      title,
      value_label: value,
      description: text(fd, "description", 1000),
      valid_until: orNull(until),
      price_label: orNull(text(fd, "price_label", 60)),
      highlight: fd.get("highlight") === "on",
      likey_pick_note: orNull(text(fd, "likey_pick_note", 200)),
      status: text(fd, "status", 20) === "verified" ? "verified" : "listed",
      is_published: fd.get("is_published") === "on",
      coupon_code: orNull(code.toUpperCase()),
    },
  };
}

/** Storage path for an upload: media/<folder>/<id>-<timestamp>.<ext> */
export function uploadPath(
  folder: "businesses" | "offers",
  id: string,
  file: File,
  now = Date.now(),
): string {
  const ext =
    { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[
      file.type
    ] ?? "img";
  return `${folder}/${id}-${now}.${ext}`;
}
