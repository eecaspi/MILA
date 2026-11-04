import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isExpired,
  mapBusinessRow,
  mapOfferRow,
  slugify,
  withoutCouponCode,
  type BusinessRow,
  type OfferRow,
} from "./mappers.ts";

const biz: BusinessRow = {
  id: "b1",
  slug: "noa",
  name: "בוטיק נועה",
  category_slug: "fashion",
  short_description: "אופנה",
  description: "  ",
  area: null,
  city: "בני ברק",
  website: "https://noa.example",
  phone: null,
  source_url: null,
  logo_url: null,
  cover_url: null,
  tags: ["שמלות", " "],
  status: "verified",
  is_real_business: true,
};
const offer: OfferRow = {
  id: "o1",
  business_id: "b1",
  kind: "coupon",
  title: "הנחה",
  description: null,
  value_label: "20% הנחה",
  valid_until: "2027-01-01",
  status: "verified",
  created_at: "2026-11-04T10:00:00Z",
  highlight: true,
  likey_pick_note: "שווה!",
  price_label: null,
  image_url: "https://x/img.webp",
};

test("business rows map to the site's shape", () => {
  const b = mapBusinessRow(biz);
  assert.ok(b);
  assert.equal(b.category, "fashion");
  assert.equal(b.area, "בני ברק", "falls back to city when area is empty");
  assert.equal(b.description, undefined, "blank text becomes undefined");
  assert.deepEqual(b.tags, ["שמלות"]);
});

test("rows with an unknown category are skipped", () => {
  assert.equal(mapBusinessRow({ ...biz, category_slug: "cars" }), null);
});

test("offer rows map, including pick note and added date", () => {
  const o = mapOfferRow(offer);
  assert.equal(o.addedAt, "2026-11-04");
  assert.deepEqual(o.likeyPick, { note: "שווה!" });
  assert.equal(o.highlight, true);
  assert.equal(o.priceLabel, undefined);
  assert.equal("couponCode" in o, false, "codes never come from offer rows");
});

test("showcase mode strips coupon codes", () => {
  const o = { id: "x", couponCode: "SECRET" };
  assert.equal(withoutCouponCode(o, false).couponCode, undefined);
  assert.equal(withoutCouponCode(o, true).couponCode, "SECRET");
  assert.equal(o.couponCode, "SECRET", "original object untouched");
});

test("slugify makes database-safe slugs", () => {
  const r = () => "abc123";
  assert.equal(slugify("Osher Ad", r), "osher-ad-abc123");
  assert.equal(slugify("בוטיק נועה", r), "biz-abc123");
  assert.match(slugify("  Café & Co!! ", r), /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test("offers stay valid through their last day, Israel time", () => {
  // 2026-11-04 23:30 in Israel (UTC+2) is still the 4th there
  assert.equal(isExpired("2026-11-04", new Date("2026-11-04T21:30:00Z")), false);
  // 00:10 on the 5th in Israel: expired
  assert.equal(isExpired("2026-11-04", new Date("2026-11-04T22:10:00Z")), true);
  assert.equal(isExpired(undefined), false);
  assert.equal(isExpired(null), false);
});
