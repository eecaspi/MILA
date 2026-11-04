import type { OfferWithBusiness } from "@/lib/types";

/** What a visitor sees instead of the benefit itself. */
export const MEMBERS_ONLY_LABEL = "הטבה לחברות לייקי";

/**
 * Offers are public as a showcase, but the benefit itself (the discount, price, details
 * and personal code) is for signed-in members. Hidden on the server, so it never reaches
 * a visitor's browser.
 */
export function forViewer<T extends OfferWithBusiness>(offers: T[], signedIn: boolean): T[] {
  return signedIn ? offers : offers.map(lockOffer);
}

export function lockOffer<T extends OfferWithBusiness>(offer: T): T {
  return {
    ...offer,
    valueLabel: MEMBERS_ONLY_LABEL,
    priceLabel: undefined,
    description: "",
    likeyPick: undefined,
    couponCode: undefined,
    locked: true,
  };
}
