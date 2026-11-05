import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSuggestions, matchesBusiness, matchesQuery } from "./search.ts";
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
