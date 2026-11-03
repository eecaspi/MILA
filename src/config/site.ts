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
    /** Phase 2+ — flip on as they are built. */
    communityRecommendations: false,
    adminDashboard: false,
    affiliateProgram: false,
    auth: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
