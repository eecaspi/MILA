import type { OfferWithBusiness } from "@/lib/types";

/** Case-insensitive match of every word in the query against the offer's text fields. */
export function matchesQuery(offer: OfferWithBusiness, query: string | undefined): boolean {
  const words = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [
    offer.title,
    offer.valueLabel,
    offer.description,
    offer.business.name,
    offer.business.shortDescription,
    ...offer.business.tags,
  ]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}
