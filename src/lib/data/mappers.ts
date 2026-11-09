/**
 * Converts database rows (snake_case, see supabase/migrations) into the site's
 * domain types. Pure functions so they can be unit-tested without a database.
 */
import { isCategorySlug } from "../../data/categories.ts";
import type { Business, CodeMode, Offer, OfferKind, VerificationStatus } from "../types.ts";

export interface BusinessRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  short_description: string | null;
  description: string | null;
  area: string | null;
  city: string | null;
  website: string | null;
  phone: string | null;
  source_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls?: string[] | null;
  tags: string[] | null;
  status: VerificationStatus;
  is_real_business: boolean;
}

export interface OfferRow {
  id: string;
  business_id: string;
  kind: OfferKind;
  title: string;
  description: string | null;
  value_label: string;
  valid_until: string | null;
  starts_on: string | null;
  redeem_channel: string | null;
  code_mode?: string | null;
  redeem_url?: string | null;
  terms?: string | null;
  usage_limit?: string | null;
  status: VerificationStatus;
  created_at: string;
  highlight: boolean | null;
  unlisted?: boolean | null;
  likey_pick_note: string | null;
  price_label: string | null;
  image_url: string | null;
  image_fit?: string | null;
}

export const BUSINESS_COLUMNS =
  "id, slug, name, category_slug, short_description, description, area, city, website, phone, source_url, logo_url, cover_url, gallery_urls, tags, status, is_real_business";
export const OFFER_COLUMNS =
  "id, business_id, kind, title, description, value_label, valid_until, starts_on, redeem_channel, code_mode, redeem_url, terms, usage_limit, status, created_at, highlight, likey_pick_note, price_label, image_url, image_fit, unlisted";

const opt = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

export function parseCodeMode(v: string | null | undefined): CodeMode {
  return v === "personal" || v === "daily" || v === "link" || v === "store" ? v : "fixed";
}

/** Short line under a code control: what kind of code it is and how long it lasts. */
export const codeModeNote: Record<"fixed" | "personal" | "daily", string> = {
  fixed: "הקוד של העסק",
  personal: "קוד אישי וחד־פעמי · תקף ל־24 שעות",
  daily: "קוד היום · תקף עד סוף היום",
};

/** Returns null for rows the site can't show (e.g. an unknown category). */
export function mapBusinessRow(row: BusinessRow): Business | null {
  if (!isCategorySlug(row.category_slug)) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_slug,
    shortDescription: row.short_description ?? "",
    description: opt(row.description),
    area: opt(row.area) ?? opt(row.city) ?? "",
    website: opt(row.website),
    phone: opt(row.phone),
    sourceUrl: opt(row.source_url),
    logoUrl: opt(row.logo_url),
    coverUrl: opt(row.cover_url),
    galleryUrls: (row.gallery_urls ?? []).filter((u) => u.trim()),
    tags: (row.tags ?? []).filter((t) => t.trim()),
    status: row.status,
    isRealBusiness: row.is_real_business,
  };
}

/** Coupon codes are never part of this mapping: they live in an admin-only table. */
export function mapOfferRow(row: OfferRow): Offer {
  const note = opt(row.likey_pick_note);
  return {
    id: row.id,
    businessId: row.business_id,
    kind: row.kind,
    title: row.title,
    description: row.description ?? "",
    valueLabel: row.value_label,
    validUntil: row.valid_until ?? undefined,
    startsOn: row.starts_on ?? undefined,
    codeMode: parseCodeMode(row.code_mode),
    redeemUrl: opt(row.redeem_url),
    terms: opt(row.terms),
    usageLimit: opt(row.usage_limit),
    redeemChannel:
      row.redeem_channel === "online" || row.redeem_channel === "store" || row.redeem_channel === "both"
        ? row.redeem_channel
        : undefined,
    status: row.status,
    addedAt: row.created_at.slice(0, 10),
    highlight: Boolean(row.highlight),
    unlisted: Boolean(row.unlisted),
    likeyPick: note ? { note } : undefined,
    priceLabel: opt(row.price_label),
    imageUrl: opt(row.image_url),
    imageFit: row.image_fit === "top" || row.image_fit === "bottom" || row.image_fit === "contain" ? row.image_fit : "cover",
  };
}

/** Removes coupon codes when the site is in showcase mode. */
export function withoutCouponCode<T extends { couponCode?: string }>(offer: T, show: boolean): T {
  if (show) return offer;
  const copy = { ...offer };
  delete copy.couponCode;
  return copy;
}

/** URL-safe slug. Hebrew names produce no latin letters, so a short random suffix is used. */
export function slugify(
  name: string,
  random = () => Math.random().toString(36).slice(2, 8),
): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
  return base ? `${base}-${random()}` : `biz-${random()}`;
}

/**
 * An offer is valid through the whole of its last day, Israel time, and
 * disappears from the site from the next morning (00:00 in Israel).
 */
export function isExpired(validUntil: string | undefined | null, now = new Date()): boolean {
  if (!validUntil) return false;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
  return validUntil.slice(0, 10) < today;
}

/** True while the offer's start date is still ahead (Israel time). */
export function isUpcoming(startsOn: string | undefined | null, now = new Date()): boolean {
  if (!startsOn) return false;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
  return startsOn.slice(0, 10) > today;
}

export const redeemChannelLabel = {
  online: "אונליין",
  store: "בחנות",
  both: "אונליין ובחנות",
} as const;

/** Whole days from today (Israel) until the offer's last day; 0 = ends today, null = no end date. */
export function daysUntilEnd(validUntil: string | undefined | null, now = new Date()): number | null {
  if (!validUntil) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
  return Math.round((Date.parse(validUntil.slice(0, 10)) - Date.parse(today)) / DAY_MS);
}

export type OfferBadge = { label: string; tone: "hot" | "new" };

const DAY_MS = 86_400_000;

/**
 * A small status tag for an offer card: "מסתיים היום" / "מסתיים בקרוב" (within 3 days),
 * or "חדש" (added in the last 14 days). Ended and demo offers get none.
 */
export function offerBadge(
  offer: { validUntil?: string; startsOn?: string; addedAt: string; status: string },
  now = new Date(),
): OfferBadge | null {
  if (offer.status === "demo" || isExpired(offer.validUntil, now)) return null;
  if (isUpcoming(offer.startsOn, now)) return { label: "בקרוב", tone: "new" };
  if (offer.validUntil) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
    const days = Math.round(
      (Date.parse(offer.validUntil.slice(0, 10)) - Date.parse(today)) / DAY_MS,
    );
    if (days === 0) return { label: "מסתיים היום", tone: "hot" };
    if (days > 0 && days <= 3) return { label: "מסתיים בקרוב", tone: "hot" };
  }
  const added = Date.parse(offer.addedAt);
  if (!Number.isNaN(added) && now.getTime() - added <= 14 * DAY_MS && added <= now.getTime())
    return { label: "חדש", tone: "new" };
  return null;
}
