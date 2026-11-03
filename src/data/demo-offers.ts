import type { Offer } from "@/lib/types";

/**
 * DEMO OFFERS — every offer here is fictional and belongs to a fictional sample
 * business. No offer is ever attached to a real business until it is verified
 * directly with that business (status: "verified").
 */
export const demoOffers: Offer[] = [
  {
    id: "offer-boutique-season",
    businessId: "biz-sample-boutique",
    kind: "deal",
    title: "מבצע החלפת עונה",
    description: "הדגמה: הנחה על קולקציית החורף לחברות הקהילה.",
    valueLabel: "20% הנחה",
    validUntil: "2026-12-31",
    status: "demo",
  },
  {
    id: "offer-boutique-second",
    businessId: "biz-sample-boutique",
    kind: "coupon",
    title: "הפריט השני בחצי מחיר",
    description: "הדגמה: קוד קופון למימוש בקופה או באתר.",
    valueLabel: "50% על הפריט השני",
    couponCode: "DEMO-MILA50",
    validUntil: "2026-12-15",
    status: "demo",
  },
  {
    id: "offer-wigs-wash",
    businessId: "biz-sample-wigs",
    kind: "coupon",
    title: "חפיפה וסירוק במחיר מיוחד",
    description: "הדגמה: קופון לטיפול ראשון בסלון.",
    valueLabel: "₪40 הנחה",
    couponCode: "DEMO-WIG40",
    validUntil: "2027-01-31",
    status: "demo",
  },
  {
    id: "offer-events-hall",
    businessId: "biz-sample-events",
    kind: "deal",
    title: "חבילת שבע ברכות",
    description: "הדגמה: הטבה בהזמנת אירוע באמצע השבוע.",
    valueLabel: "קינוח מתנה",
    validUntil: "2027-03-01",
    status: "demo",
  },
  {
    id: "offer-kitchen-pesach",
    businessId: "biz-sample-kitchen",
    kind: "coupon",
    title: "הכנות לחג — כלי מטבח",
    description: "הדגמה: קופון על סטים של סירים ומחבתות.",
    valueLabel: "15% הנחה",
    couponCode: "DEMO-HOME15",
    validUntil: "2027-04-01",
    status: "demo",
  },
];
