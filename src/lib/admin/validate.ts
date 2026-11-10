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

export const MAX_GALLERY = 8;

/** Several uploaded images from one multi-file input (empty picks are ignored). */
export function imageFiles(
  fd: FormData,
  name: string,
  errors: FieldErrors,
  max = MAX_GALLERY,
): File[] {
  const files: File[] = [];
  for (const f of fd.getAll(name)) {
    if (typeof f === "string" || f.size === 0) continue;
    if (!IMAGE_TYPES.includes(f.type)) {
      errors[name] = "אפשר להעלות רק תמונות (JPG, PNG, WEBP)";
      return [];
    }
    if (f.size > MAX_IMAGE_BYTES) {
      errors[name] = "אחת התמונות גדולה מדי (עד 5MB לתמונה)";
      return [];
    }
    files.push(f);
  }
  if (files.length > max) {
    errors[name] = `אפשר עד ${max} תמונות`;
    return [];
  }
  return files;
}

/** Gallery after an edit: current photos minus the ones marked for removal, capped. */
export function keptGallery(current: string[], fd: FormData): string[] {
  const remove = new Set(
    fd.getAll("remove_gallery").filter((v): v is string => typeof v === "string"),
  );
  return current.filter((u) => !remove.has(u));
}

export interface BusinessValues {
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  area: string;
  branches: string;
  city: string | null;
  website: string | null;
  phone: string | null;
  tags: string[];
  status: "listed" | "verified";
  is_published: boolean;
  sort_order: number;
  image_fit: "cover" | "top" | "bottom" | "contain";
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
      branches: text(fd, "branches", 2000),
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
      // "להציג ראשון": pinned businesses sort before the rest (then by name)
      sort_order: fd.get("pin_first") === "on" ? -1 : 0,
      image_fit: ["top", "bottom", "contain"].includes(text(fd, "image_fit", 10))
        ? (text(fd, "image_fit", 10) as "top" | "bottom" | "contain")
        : "cover",
    },
  };
}

export interface DailyCode {
  day: string;
  code: string;
}

const MAX_DAILY = 366;

/** Adds days to a YYYY-MM-DD date (calendar arithmetic, no time zones involved). */
export function addDays(isoDay: string, days: number): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * One code per line, in order: the first is for `start`, the second for the next day, and so on.
 * Returns an error message in Hebrew when a line is not a usable code.
 */
export function parseDailyCodes(
  raw: string,
  start: string,
): { codes: DailyCode[] } | { error: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > MAX_DAILY) return { error: `אפשר עד ${MAX_DAILY} קודים בבת אחת` };
  const codes: DailyCode[] = [];
  const seen = new Set<string>();
  for (const [i, line] of lines.entries()) {
    if (!/^[A-Za-z0-9_-]{2,60}$/.test(line))
      return { error: `שורה ${i + 1}: קוד באנגלית, ספרות ומקף בלבד` };
    const code = line.toUpperCase();
    if (seen.has(code)) return { error: `שורה ${i + 1}: הקוד ${code} מופיע פעמיים` };
    seen.add(code);
    codes.push({ day: addDays(start, i), code });
  }
  return { codes };
}

function israelToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
}

export interface OfferValues {
  business_id: string;
  kind: "deal" | "coupon";
  title: string;
  value_label: string;
  description: string;
  valid_until: string | null;
  starts_on: string | null;
  redeem_channel: "online" | "store" | "stores" | "both" | null;
  code_mode: "fixed" | "personal" | "daily" | "link" | "store";
  redeem_url: string | null;
  terms: string | null;
  usage_limit: string | null;
  /** One code per day, from `daily_start`; empty when the box was left blank. */
  daily: DailyCode[];
  price_label: string | null;
  highlight: boolean;
  unlisted: boolean;
  image_fit: "cover" | "top" | "bottom" | "contain";
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
  const starts = text(fd, "starts_on", 10);
  if (starts && (!/^\d{4}-\d{2}-\d{2}$/.test(starts) || Number.isNaN(Date.parse(starts)))) {
    errors.starts_on = "תאריך לא תקין";
  } else if (starts && until && starts > until) {
    errors.starts_on = "תאריך ההתחלה אחרי תאריך הסיום";
  }
  const channel = text(fd, "redeem_channel", 10);
  const modeRaw = text(fd, "code_mode", 10);
  const codeMode =
    modeRaw === "personal" || modeRaw === "daily" || modeRaw === "link" || modeRaw === "store"
      ? modeRaw
      : "fixed";
  const redeemUrl = text(fd, "redeem_url", 300);
  if (redeemUrl && !/^https:\/\/[^\s/]+\.[^\s/]+/.test(redeemUrl)) {
    errors.redeem_url = "הקישור צריך להתחיל ב־https://";
  }
  let daily: DailyCode[] = [];
  const dailyRaw = (fd.get("daily_codes") as string | null) ?? "";
  if (dailyRaw.trim()) {
    const dailyStart = text(fd, "daily_start", 10) || israelToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dailyStart) || Number.isNaN(Date.parse(dailyStart))) {
      errors.daily_start = "תאריך לא תקין";
    } else {
      const parsedDaily = parseDailyCodes(dailyRaw, dailyStart);
      if ("error" in parsedDaily) errors.daily_codes = parsedDaily.error;
      else daily = parsedDaily.codes;
    }
  }
  const code = text(fd, "coupon_code", 60);
  if (code && !/^[A-Za-z0-9_\-]{2,60}$/.test(code))
    errors.coupon_code = "קוד קופון: אותיות באנגלית, ספרות ומקף בלבד";
  if (codeMode === "fixed" && !code && fd.get("is_published") === "on") {
    errors.coupon_code = "בקוד קבוע צריך להזין את הקוד לפני פרסום";
  }

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
      starts_on: orNull(starts),
      code_mode: codeMode,
      daily,
      redeem_url: orNull(redeemUrl),
      terms: orNull(text(fd, "terms", 600)),
      usage_limit: orNull(text(fd, "usage_limit", 100)),
      redeem_channel: channel === "online" || channel === "store" || channel === "stores" || channel === "both" ? channel : null,
      price_label: orNull(text(fd, "price_label", 60)),
      highlight: fd.get("highlight") === "on",
      unlisted: fd.get("unlisted") === "on",
      image_fit: ["top", "bottom", "contain"].includes(text(fd, "image_fit", 10))
        ? (text(fd, "image_fit", 10) as "top" | "bottom" | "contain")
        : "cover",
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
