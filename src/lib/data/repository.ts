/**
 * Data access layer.
 *
 * Pages call these functions only — never the demo arrays or Supabase directly.
 * Today they read the bundled demo data. When Supabase is configured, swap the
 * implementations here (see supabase/migrations) without touching any page.
 */
import { demoBusinesses } from "@/data/demo-businesses";
import { demoOffers } from "@/data/demo-offers";
import type { Business, CategorySlug, OfferKind, OfferWithBusiness } from "@/lib/types";

export interface BusinessFilter {
  category?: CategorySlug;
  /** Include fictional sample businesses (they exist only to host demo offers). */
  includeSamples?: boolean;
}

export async function getBusinesses(filter: BusinessFilter = {}): Promise<Business[]> {
  return demoBusinesses.filter(
    (b) =>
      (filter.includeSamples || b.isRealBusiness) &&
      (!filter.category || b.category === filter.category),
  );
}

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  return demoBusinesses.find((b) => b.slug === slug);
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
  const businesses = new Map(demoBusinesses.map((b) => [b.id, b]));

  const result: OfferWithBusiness[] = [];
  for (const offer of demoOffers) {
    const business = businesses.get(offer.businessId);
    if (!business) continue;
    if (filter.kind && offer.kind !== filter.kind) continue;
    if (filter.category && business.category !== filter.category) continue;
    if (activeOnly && offer.validUntil && new Date(offer.validUntil) < now) continue;
    result.push({ ...offer, business });
  }
  return result;
}

export async function getFeaturedOffers(limit = 3): Promise<OfferWithBusiness[]> {
  return (await getOffers()).slice(0, limit);
}
