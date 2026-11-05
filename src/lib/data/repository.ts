/**
 * Data access layer. Pages call these functions only — never Supabase or the demo arrays directly.
 *
 * Source of content:
 * - Supabase connected → published businesses/offers managed in the back office.
 * - Supabase not connected, or nothing published yet → the bundled demo content, so the
 *   showcase site never looks empty. Demo offers only ever belong to fictional businesses.
 */
import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { buildSuggestions } from "@/lib/data/search";
import { demoBusinesses } from "@/data/demo-businesses";
import { demoOffers } from "@/data/demo-offers";
import { createPublicClient } from "@/lib/supabase/public";
import type { Business, CategorySlug, Offer, OfferKind, OfferWithBusiness } from "@/lib/types";
import {
  BUSINESS_COLUMNS,
  OFFER_COLUMNS,
  isExpired,
  mapBusinessRow,
  mapOfferRow,
  withoutCouponCode,
  type BusinessRow,
  type OfferRow,
} from "./mappers";

interface Content {
  businesses: Business[];
  offers: Offer[];
  source: "database" | "demo";
}

/** Loads all published content once per request. */
const fetchContent = async (): Promise<Content> => {
  const demo: Content = { businesses: demoBusinesses, offers: demoOffers, source: "demo" };
  const supabase = createPublicClient();
  if (!supabase) return demo;

  const businessesQuery = (columns: string) =>
    supabase.from("businesses").select(columns).order("sort_order").order("name");
  const [firstTry, o] = await Promise.all([
    businessesQuery(BUSINESS_COLUMNS),
    supabase.from("offers").select(OFFER_COLUMNS).order("created_at", { ascending: false }),
  ]);
  let b = firstTry;
  // A newer column whose migration hasn't been run yet: show everything else instead of demo content.
  if (b.error?.code === "42703") {
    b = await businessesQuery(BUSINESS_COLUMNS.replace(", gallery_urls", ""));
  }
  if (b.error || o.error) {
    console.error("content load failed, showing demo content", b.error ?? o.error);
    return demo;
  }

  const businesses = ((b.data ?? []) as unknown as BusinessRow[])
    .map(mapBusinessRow)
    .filter((x): x is Business => x !== null);
  const offers = ((o.data ?? []) as OfferRow[]).map(mapOfferRow);

  // Nothing published yet: keep the showcase alive with demo content.
  if (businesses.length === 0) return demo;
  if (offers.length === 0) {
    return {
      businesses: [...businesses, ...demoBusinesses.filter((x) => !x.isRealBusiness)],
      offers: demoOffers,
      source: "database",
    };
  }
  return { businesses, offers, source: "database" };
};

/**
 * Kept for 60 seconds across visitors (and per request), so a busy day doesn't hit the database
 * on every page view. Saving in the back office clears it at once (tag "content").
 */
const loadContent = cache(unstable_cache(fetchContent, ["site-content"], { revalidate: 60, tags: ["content"] }));

export async function getContentSource(): Promise<Content["source"]> {
  return (await loadContent()).source;
}

export interface BusinessFilter {
  category?: CategorySlug;
  /** Include fictional sample businesses (they exist only to host demo offers). */
  includeSamples?: boolean;
}

export async function getBusinesses(filter: BusinessFilter = {}): Promise<Business[]> {
  const { businesses } = await loadContent();
  return businesses.filter(
    (b) =>
      (filter.includeSamples || b.isRealBusiness) &&
      (!filter.category || b.category === filter.category),
  );
}

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  return (await loadContent()).businesses.find((b) => b.slug === slug);
}

export interface OfferFilter {
  category?: CategorySlug;
  kind?: OfferKind;
  /** Hide offers whose validUntil is in the past. Defaults to true. */
  activeOnly?: boolean;
  now?: Date;
}

export async function getOffers(filter: OfferFilter = {}): Promise<OfferWithBusiness[]> {
  const { activeOnly = true, now = new Date() } = filter;
  const content = await loadContent();
  const businesses = new Map(content.businesses.map((b) => [b.id, b]));

  const result: OfferWithBusiness[] = [];
  for (const offer of content.offers) {
    const business = businesses.get(offer.businessId);
    if (!business) continue;
    if (filter.kind && offer.kind !== filter.kind) continue;
    if (filter.category && business.category !== filter.category) continue;
    if (activeOnly && isExpired(offer.validUntil, now)) continue;
    result.push(withoutCouponCode({ ...offer, business }, siteConfig.features.showCouponCodes));
  }
  return result;
}

/** Words offered while typing in the search box. */
export async function getSearchSuggestions(): Promise<string[]> {
  const [businesses, offers] = await Promise.all([getBusinesses(), getOffers()]);
  return buildSuggestions([
    categories.map((c) => c.name),
    businesses.map((b) => b.name),
    businesses.flatMap((b) => b.tags),
    offers.map((o) => o.title),
  ]);
}

/** "המבצעים הכי שווים" — highlighted first, then the newest, so the section is never empty. */
export async function getHighlightedOffers(limit = 4): Promise<OfferWithBusiness[]> {
  const all = await getOffers();
  const picked = all.filter((o) => o.highlight);
  return [...picked, ...all.filter((o) => !o.highlight)].slice(0, limit);
}

/** "מה חדש אצל ליקי?" — most recently added first. */
export async function getNewestOffers(limit = 3): Promise<OfferWithBusiness[]> {
  return (await getOffers()).sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);
}

/** "ליקי ממליצה" — hand-picked offers with a note. */
export async function getLikeyPicks(limit = 3): Promise<OfferWithBusiness[]> {
  return (await getOffers()).filter((o) => o.likeyPick).slice(0, limit);
}

export async function getOfferById(id: string): Promise<OfferWithBusiness | undefined> {
  return (await getOffers({ activeOnly: false })).find((o) => o.id === id);
}
