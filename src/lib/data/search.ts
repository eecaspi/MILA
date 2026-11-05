import type { Business, OfferWithBusiness } from "@/lib/types";

function words(query: string | undefined): string[] {
  return (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
}

/** Case-insensitive match of every word in the query against the offer's text fields. */
export function matchesQuery(
  offer: OfferWithBusiness,
  query: string | undefined,
  categoryName = "",
): boolean {
  const ws = words(query);
  if (ws.length === 0) return true;
  const haystack = [
    offer.title,
    offer.valueLabel,
    offer.description,
    offer.business.name,
    offer.business.shortDescription,
    categoryName,
    ...offer.business.tags,
  ]
    .join(" ")
    .toLowerCase();
  return ws.every((w) => haystack.includes(w));
}

/** The same for a business (its name, description, area, tags and category). */
export function matchesBusiness(
  business: Business,
  query: string | undefined,
  categoryName = "",
): boolean {
  const ws = words(query);
  if (ws.length === 0) return true;
  const haystack = [
    business.name,
    business.shortDescription,
    business.description ?? "",
    business.area,
    categoryName,
    ...business.tags,
  ]
    .join(" ")
    .toLowerCase();
  return ws.every((w) => haystack.includes(w));
}

/** Unique, tidy suggestions for the search box (business names, categories, tags, offer titles). */
export function buildSuggestions(parts: string[][], limit = 80): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of parts) {
    for (const raw of list) {
      const v = raw.trim();
      if (v.length < 2 || v.length > 50 || seen.has(v)) continue;
      seen.add(v);
      out.push(v);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
