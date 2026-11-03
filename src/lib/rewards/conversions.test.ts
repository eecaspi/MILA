import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getAdapter,
  registerAdapter,
  toRecordConversionArgs,
  validateEvent,
} from "./conversions.ts";

const event = {
  externalId: "order-1",
  status: "pending" as const,
  commissionAgorot: 2500,
  occurredAt: "2026-11-03T10:00:00Z",
  userId: "u1",
};

test("no network adapter is registered by default", () => {
  assert.equal(getAdapter("awin"), undefined);
});

test("adapters can be registered for future networks", () => {
  registerAdapter({ network: "test-net", verify: async () => true, parse: () => [] });
  assert.equal(getAdapter("test-net")?.network, "test-net");
});

test("validateEvent accepts a well-formed event", () => {
  assert.equal(validateEvent(event), null);
});

test("validateEvent rejects bad input before it reaches the database", () => {
  assert.equal(validateEvent({ ...event, externalId: "" }), "missing externalId");
  assert.equal(validateEvent({ ...event, commissionAgorot: -1 }), "invalid commission");
  assert.equal(validateEvent({ ...event, commissionAgorot: 12.5 }), "invalid commission");
  assert.equal(validateEvent({ ...event, occurredAt: "yesterday" }), "invalid occurredAt");
  assert.equal(
    validateEvent({ ...event, status: "paid" as unknown as "pending" }),
    "invalid status",
  );
});

test("toRecordConversionArgs maps to the database function's parameters", () => {
  assert.deepEqual(toRecordConversionArgs("awin", event), {
    p_network: "awin",
    p_external_id: "order-1",
    p_status: "pending",
    p_commission_agorot: 2500,
    p_occurred_at: "2026-11-03T10:00:00Z",
    p_user: "u1",
    p_business: null,
    p_order_amount_agorot: null,
    p_referral_link: null,
    p_raw: null,
  });
});
