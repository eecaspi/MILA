/**
 * Central site settings.
 *
 * MILA is a temporary brand name. To rebrand, change the values here —
 * every page, the header, footer and metadata read from this object.
 */
export const siteConfig = {
  brand: {
    name: "MILA",
    /** Hebrew display name shown next to the logo. */
    nameHe: "מילה",
    tagline: "הקהילה שלך לקניות חכמות, עסקים מומלצים והטבות",
    description:
      "מרכז קהילתי לנשים: מדריך עסקים, מבצעים, קופונים והמלצות מהקהילה — במקום אחד, בשפה שלך.",
  },
  locale: {
    lang: "he",
    dir: "rtl",
    currency: "ILS",
    region: "IL",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    email: "hello@example.com",
  },
  nav: [
    { href: "/", label: "ראשי" },
    { href: "/businesses", label: "מדריך עסקים" },
    { href: "/deals", label: "מבצעים וקופונים" },
    { href: "/community", label: "המלצות הקהילה" },
  ],
  features: {
    /** Flip on as they are built. */
    communityRecommendations: false,
    affiliateProgram: false,
    /**
     * Whether points are actually earned is NOT set here: it is the
     * rewards_program switch in the database, controlled from /admin/rewards.
     */
    rewardsMarketplace: false,
    membershipTiers: false,
    challenges: false,
    /** Raffles, prize wheels, surprise draws. Must stay false until legal review. */
    gamesOfChance: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
