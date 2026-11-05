import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSuggestions, matchesBusiness, matchesQuery, searchOffers, topTerms } from "./search.ts";
import type { OfferWithBusiness } from "../types.ts";

const offer = {
  title: "הנחה על פאות",
  valueLabel: "20% הנחה",
  description: "לכל הפאות החדשות",
  business: { name: "סלון נועה", shortDescription: "יופי", tags: ["פאות", "יופי"] },
} as unknown as OfferWithBusiness;

test("search matches words across title, business and tags", () => {
  assert.equal(matchesQuery(offer, undefined), true);
  assert.equal(matchesQuery(offer, "   "), true);
  assert.equal(matchesQuery(offer, "פאות"), true);
  assert.equal(matchesQuery(offer, "נועה 20%"), true);
  assert.equal(matchesQuery(offer, "נועה נעליים"), false);
  assert.equal(matchesQuery(offer, "ללא התאמה"), false);
});

test("category names are searchable and suggestions are unique", () => {
  assert.equal(matchesQuery(offer, "אופנה", "אופנה"), true);
  assert.equal(matchesQuery(offer, "אופנה"), false);
  const biz = { name: "סלון נועה", shortDescription: "יופי", area: "בני ברק", tags: ["פאות"] } as never;
  assert.equal(matchesBusiness(biz, "נועה"), true);
  assert.equal(matchesBusiness(biz, "ברק פאות"), true);
  assert.equal(matchesBusiness(biz, "נעליים"), false);
  assert.deepEqual(buildSuggestions([["א", "פאות", "פאות"], [" סלון נועה "]]), ["פאות", "סלון נועה"]);
});

test("Hebrew prefixes, plurals and final letters still match", () => {
  const shoes = {
    title: "הנחה על נעליים",
    valueLabel: "15% הנחה",
    description: "",
    business: { name: "קטנטנים", shortDescription: "לילדים", tags: ["ילדים"] },
  } as unknown as OfferWithBusiness;
  assert.equal(matchesQuery(shoes, "נעלי ילדים"), true);
  assert.equal(matchesQuery(shoes, "לילד"), true);
  assert.equal(matchesQuery(shoes, "הנעל"), true);
  assert.equal(matchesQuery(shoes, "תיק"), false);
});

test("when no offer matches every word, the closest ones are offered", () => {
  const a = { title: "נעלי ילדים", valueLabel: "", description: "", business: { name: "א", shortDescription: "", tags: [] } } as unknown as OfferWithBusiness;
  const b = { title: "שמלות", valueLabel: "", description: "", business: { name: "ב", shortDescription: "", tags: [] } } as unknown as OfferWithBusiness;
  const exact = searchOffers([a, b], "נעלי ילדים", () => "");
  assert.deepEqual(exact.items, [a]);
  assert.equal(exact.approximate, false);
  const near = searchOffers([a, b], "נעלי שמלות", () => "");
  assert.equal(near.approximate, true);
  assert.equal(near.items.length, 2);
  assert.equal(searchOffers([a, b], "תיק", () => "").items.length, 0);
});

test("top terms are the most common tags", () => {
  assert.deepEqual(topTerms([["פאות", "יופי"], ["פאות"], ["יופי", "תכשיטים"], ["פאות"]], 2), ["פאות", "יופי"]);
});
