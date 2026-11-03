/**
 * Data integrity checks for the demo seed. Run: npm run check:data
 *
 * The key rule: demo offers may only belong to fictional sample businesses,
 * so a real business is never shown with an offer it did not agree to.
 */
import { categories } from "../src/data/categories.ts";
import { demoBusinesses } from "../src/data/demo-businesses.ts";
import { demoOffers } from "../src/data/demo-offers.ts";

const errors: string[] = [];
const check = (ok: boolean, message: string) => {
  if (!ok) errors.push(message);
};

const categorySlugs = new Set(categories.map((c) => c.slug));
const businessById = new Map(demoBusinesses.map((b) => [b.id, b]));

const dupes = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);
check(dupes(demoBusinesses.map((b) => b.id)).length === 0, "Duplicate business ids");
check(dupes(demoBusinesses.map((b) => b.slug)).length === 0, "Duplicate business slugs");
check(dupes(demoOffers.map((o) => o.id)).length === 0, "Duplicate offer ids");

for (const b of demoBusinesses) {
  check(categorySlugs.has(b.category), `${b.id}: unknown category ${b.category}`);
  if (b.isRealBusiness) {
    check(Boolean(b.sourceUrl), `${b.id}: real business needs a sourceUrl`);
  }
  if (b.website) {
    check(b.website.startsWith("https://"), `${b.id}: website must be https`);
  }
}

for (const o of demoOffers) {
  const business = businessById.get(o.businessId);
  check(Boolean(business), `${o.id}: unknown business ${o.businessId}`);
  if (business && o.status !== "verified") {
    check(
      !business.isRealBusiness,
      `${o.id}: unverified offer attached to real business ${business.id}`,
    );
  }
  if (o.status === "demo" && o.couponCode) {
    check(o.couponCode.startsWith("DEMO-"), `${o.id}: demo coupon codes must start with DEMO-`);
  }
  if (o.validUntil) check(!Number.isNaN(Date.parse(o.validUntil)), `${o.id}: invalid validUntil`);
  if (o.commissionRate !== undefined) {
    check(o.commissionRate >= 0 && o.commissionRate <= 1, `${o.id}: commissionRate out of range`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} data problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(
  `✓ Data OK: ${demoBusinesses.length} businesses (${demoBusinesses.filter((b) => b.isRealBusiness).length} real), ${demoOffers.length} offers, ${categories.length} categories`,
);
