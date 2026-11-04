import { test } from "node:test";
import assert from "node:assert/strict";
import { MEMBERS_ONLY_LABEL, forViewer } from "./visibility.ts";
import type { OfferWithBusiness } from "../types.ts";

const offer = {
  id: "o1",
  businessId: "b1",
  kind: "coupon",
  title: "הנחה לחברות",
  description: "20% על כל החנות",
  valueLabel: "20% הנחה",
  priceLabel: "₪80",
  couponCode: "NOA20",
  likeyPick: { note: "אוהבת" },
  status: "verified",
  addedAt: "2026-01-01",
  business: { id: "b1", name: "עסק" },
} as unknown as OfferWithBusiness;

test("visitors never receive the benefit details", () => {
  const [o] = forViewer([offer], false);
  assert.equal(o.valueLabel, MEMBERS_ONLY_LABEL);
  assert.equal(o.description, "");
  assert.equal(o.priceLabel, undefined);
  assert.equal(o.couponCode, undefined);
  assert.equal(o.likeyPick, undefined);
  assert.equal(o.locked, true);
  assert.equal(o.title, "הנחה לחברות");
  assert.ok(!JSON.stringify(o).includes("20%"));
});

test("members see everything", () => {
  const [o] = forViewer([offer], true);
  assert.equal(o.valueLabel, "20% הנחה");
  assert.equal(o.locked, undefined);
});
