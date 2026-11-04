/**
 * Central site settings. Every page, the header, footer and metadata read from
 * this object, so brand and copy changes happen here.
 */
export const siteConfig = {
  brand: {
    /** Official brand name — always shown in Hebrew. */
    name: "ליקי",
    /** Latin name for places that need it (URLs, app stores, English contexts). */
    nameEn: "Liky",
    /** Official slogan — must be written exactly like this. */
    slogan: "יש לי קישור בשבילך.",
    tagline: "ההטבות, המבצעים וההמלצות הכי שוות – במקום אחד, במיוחד בשבילך.",
    description:
      "ליקי – החברה שתמיד יודעת איפה יש משהו שווה: מבצעים, הטבות, עסקים מומלצים וקהילה של נשים שמשתפות מציאות.",
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
    { href: "/deals", label: "ליקי מצאה לך" },
    { href: "/businesses", label: "העסקים שלנו" },
    { href: "/community", label: "החברות של ליקי" },
  ],
  community: {
    /**
     * WhatsApp community/group invite link. Leave null until the groups are open:
     * the site then shows a "coming soon" state instead of a dead link.
     */
    whatsappUrl: "https://chat.whatsapp.com/KgTRTaqAQbe77y0hZapU1y" as string | null,
  },
  features: {
    /**
     * Showcase stage: offers show their benefit (e.g. "20% הנחה") but never the
     * coupon code. Codes stay in the database for later and are stripped from
     * page data while this is false.
     */
    showCouponCodes: false as boolean,
    /**
     * Public member sign-up. Off while the club is being built: visitors see
     * "מועדון הלקוחות · בעבודה" and only the team signs in (accounts are created
     * by an admin). The sign-up action refuses on the server while this is false.
     */
    memberSignup: true as boolean,
    /**
     * Personal one-day coupon codes: a signed-in member can claim a code on an offer
     * (max 3 live codes, each valid 24 hours). The public codes above stay hidden.
     */
    personalCodes: true as boolean,
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
    /** The ליקי AI character. Until true, a branded placeholder is shown. */
    aiCharacter: false,
    /** Raffles, prize wheels, surprise draws. Must stay false until legal review. */
    gamesOfChance: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
