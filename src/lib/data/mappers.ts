/**
 * Converts database rows (snake_case, see supabase/migrations) into the site's
 * domain types. Pure functions so they can be unit-tested without a database.
 */
import { isCategorySlug } from "../../data/categories.ts";
import type { Business, Offer, OfferKind, VerificationStatus } from "../types.ts";

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
  status: VerificationStatus;
  created_at: string;
  highlight: boolean | null;
  likey_pick_note: string | null;
  price_label: string | null;
  image_url: string | null;
}

export const BUSINESS_COLUMNS =
  "id, slug, name, category_slug, short_description, description, area, city, website, phone, source_url, logo_url, cover_url, gallery_urls, tags, status, is_real_business";
export const OFFER_COLUMNS =
  "id, business_id, kind, title, description, value_label, valid_until, status, created_at, highlight, likey_pick_note, price_label, image_url";

const opt = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

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
    status: row.status,
    addedAt: row.created_at.slice(0, 10),
    highlight: Boolean(row.highlight),
    likeyPick: note ? { note } : undefined,
    priceLabel: opt(row.price_label),
    imageUrl: opt(row.image_url),
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
