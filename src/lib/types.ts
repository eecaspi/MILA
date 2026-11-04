/**
 * Domain model. Mirrors supabase/migrations/0001_initial_schema.sql.
 */

export type CategorySlug =
  | "food"
  | "fashion"
  | "baby-kids"
  | "home"
  | "books-judaica"
  | "health-community"
  | "beauty"
  | "events"
  | "gifts"
  | "leisure";

export type CategoryTone = "rose" | "peach" | "lilac" | "mint" | "sky" | "sand" | "coral" | "pearl";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Pastel color used for this category's tiles, monograms and image placeholders. */
  tone: CategoryTone;
}

/**
 * How trustworthy a listing or offer is.
 * - `demo`: placeholder content for development; no relationship with the business.
 * - `listed`: added by our team from public information; not yet confirmed by the business.
 * - `verified`: confirmed directly with the business / under a commercial agreement.
 */
export type VerificationStatus = "demo" | "listed" | "verified";

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  shortDescription: string;
  /** Free-text service area, e.g. "פריסה ארצית" or a city name. */
  area: string;
  website?: string;
  /** Where the public facts on this listing came from (for internal checking). */
  sourceUrl?: string;
  tags: string[];
  status: VerificationStatus;
  /** True when this business is a real company (shown as directory listing only). */
  isRealBusiness: boolean;
  /** Longer text for the business page (back office). */
  description?: string;
  phone?: string;
  logoUrl?: string;
  coverUrl?: string;
  /** A few photos from the business (products, the shop). */
  galleryUrls?: string[];
}

export type OfferKind = "deal" | "coupon";

export interface Offer {
  id: string;
  businessId: string;
  kind: OfferKind;
  title: string;
  description: string;
  /** Human-readable value, e.g. "15% הנחה". */
  valueLabel: string;
  couponCode?: string;
  /** ISO date. */
  validUntil?: string;
  status: VerificationStatus;
  /** ISO date the offer was added to the site (drives "מה חדש אצל ליקי?"). */
  addedAt: string;
  /** Shown in "המבצעים הכי שווים". */
  highlight?: boolean;
  /** Hand-picked for "ליקי ממליצה", with a one-line reason in ליקי's voice. */
  likeyPick?: { note: string };
  /** Real price information, only when the business provided it. Never invented. */
  priceLabel?: string;
  /** Product/offer image supplied by the business. A category illustration is shown otherwise. */
  imageUrl?: string;
  /** Reserved for the affiliate phase: commission rate on this offer (0–1). */
  commissionRate?: number;
}

export interface OfferWithBusiness extends Offer {
  business: Business;
}

/* ---- Affiliate program (phase 3 — types only, not yet used) ---- */

export interface Affiliate {
  id: string;
  userId: string;
  displayName: string;
  referralCode: string;
  status: "pending" | "active" | "suspended";
}

export interface ReferralLink {
  id: string;
  affiliateId: string;
  offerId: string | null;
  businessId: string | null;
  code: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  referralLinkId: string;
  amountAgorot: number;
  status: "pending" | "approved" | "paid" | "rejected";
}
