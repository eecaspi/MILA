import type { Business, OfferWithBusiness } from "@/lib/types";

const FINAL: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

/** Lower-case, no niqqud or quotes, final letters as regular ones, so "ילדים" and "ילדימ" look alike. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["\u05F4\u05F3'`]/g, "")
    .replace(/[-\u05BE_/]/g, " ")
    .replace(/[ךםןףץ]/g, (c) => FINAL[c] ?? c);
}

const PREFIXES = ["ה", "ו", "ב", "ל", "מ", "כ", "ש"];
const SUFFIXES = ["ימ", "ות", "ת", "י", "ה"];

/** The word as typed, without a Hebrew prefix letter, and without a plural/feminine ending. */
function variants(word: string): string[] {
  const out = new Set<string>([word]);
  const bases = [word];
  if (word.length > 3 && PREFIXES.includes(word[0]!)) {
    bases.push(word.slice(1));
    out.add(word.slice(1));
  }
  for (const b of bases) {
    for (const s of SUFFIXES) {
      if (b.length - s.length >= 3 && b.endsWith(s)) out.add(b.slice(0, -s.length));
    }
  }
  return [...out].filter((v) => v.length >= 2);
}

function queryWords(query: string | undefined): string[][] {
  return normalize(query ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map(variants);
}

/** How many of the query's words appear in the text (a word counts if it, or its stem, does). */
export function matchCount(text: string, query: string | undefined): number {
  const hay = normalize(text);
  return queryWords(query).filter((vs) => vs.some((v) => hay.includes(v))).length;
}

export function wordCount(query: string | undefined): number {
  return queryWords(query).length;
}

function offerText(offer: OfferWithBusiness, categoryName: string): string {
  return [
    offer.title,
    offer.valueLabel,
    offer.description,
    offer.business.name,
    offer.business.shortDescription,
    categoryName,
    ...offer.business.tags,
  ].join(" ");
}

function businessText(business: Business, categoryName: string): string {
  return [
    business.name,
    business.shortDescription,
    business.description ?? "",
    business.area,
    categoryName,
    ...business.tags,
  ].join(" ");
}

/** Every word of the query is found in the offer's text. */
export function matchesQuery(
  offer: OfferWithBusiness,
  query: string | undefined,
  categoryName = "",
): boolean {
  const n = wordCount(query);
  return n === 0 || matchCount(offerText(offer, categoryName), query) === n;
}

/** The same for a business (its name, description, area, tags and category). */
export function matchesBusiness(
  business: Business,
  query: string | undefined,
  categoryName = "",
): boolean {
  const n = wordCount(query);
  return n === 0 || matchCount(businessText(business, categoryName), query) === n;
}

export interface SearchResult<T> {
  items: T[];
  /** True when nothing matched every word, so these match only some of them (closest first). */
  approximate: boolean;
}

function rank<T>(items: T[], query: string | undefined, text: (t: T) => string): SearchResult<T> {
  const n = wordCount(query);
  if (n === 0) return { items, approximate: false };
  const scored = items.map((t) => ({ t, c: matchCount(text(t), query) }));
  const exact = scored.filter((s) => s.c === n).map((s) => s.t);
  if (exact.length > 0 || n < 2) return { items: exact, approximate: false };
  const partial = scored
    .filter((s) => s.c > 0)
    .sort((a, b) => b.c - a.c)
    .map((s) => s.t);
  return { items: partial, approximate: partial.length > 0 };
}

export function searchOffers(
  offers: OfferWithBusiness[],
  query: string | undefined,
  categoryName: (o: OfferWithBusiness) => string,
): SearchResult<OfferWithBusiness> {
  return rank(offers, query, (o) => offerText(o, categoryName(o)));
}

export function searchBusinesses(
  businesses: Business[],
  query: string | undefined,
  categoryName: (b: Business) => string,
): SearchResult<Business> {
  return rank(businesses, query, (b) => businessText(b, categoryName(b)));
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

/** The most common tags, as ideas for what to search. */
export function topTerms(tagLists: string[][], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const list of tagLists) {
    for (const raw of new Set(list.map((t) => t.trim()).filter((t) => t.length >= 2))) {
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "he"))
    .slice(0, limit)
    .map(([t]) => t);
}
