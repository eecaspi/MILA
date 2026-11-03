import { test } from "node:test";
import assert from "node:assert/strict";
import {
  awardMessage,
  describeTransaction,
  formatPoints,
  parseAwardResult,
  txSourceLabel,
  txStatusLabel,
  txTypeLabel,
} from "./format.ts";

test("formatPoints signs amounts and uses a real minus sign", () => {
  assert.equal(formatPoints(50), "+50");
  assert.equal(formatPoints(-20), "−20");
  assert.equal(formatPoints(0), "0");
  assert.equal(formatPoints(1500), `+${(1500).toLocaleString("he-IL")}`);
});

test("every ledger enum value has a Hebrew label", () => {
  for (const t of ["earn", "redeem", "reversal", "adjustment", "expiration"] as const) {
    assert.ok(txTypeLabel[t]);
  }
  for (const s of ["purchase", "activity", "admin", "redemption", "system"] as const) {
    assert.ok(txSourceLabel[s]);
  }
  for (const s of ["pending", "confirmed", "cancelled"] as const) {
    assert.ok(txStatusLabel[s]);
  }
});

test("describeTransaction explains reversals and admin notes", () => {
  assert.equal(
    describeTransaction({ type: "earn", source: "activity", note: null }),
    "פעילות בקהילה",
  );
  assert.equal(
    describeTransaction({ type: "reversal", source: "purchase", note: null }),
    "ביטול: קנייה דרך MILA",
  );
  assert.equal(
    describeTransaction({ type: "adjustment", source: "admin", note: "פיצוי" }),
    "עדכון מצוות MILA: פיצוי",
  );
});

test("awardMessage covers every server outcome", () => {
  assert.equal(
    awardMessage({ status: "awarded", transaction_id: "t", points: 50 }).tone,
    "success",
  );
  assert.match(awardMessage({ status: "awarded", transaction_id: "t", points: 50 }).text, /50/);
  assert.equal(
    awardMessage({ status: "already_awarded", transaction_id: "t", points: 50 }).tone,
    "info",
  );
  for (const reason of [
    "program_disabled",
    "rule_inactive",
    "outside_campaign_window",
    "max_per_user_reached",
    "profile_incomplete",
  ] as const) {
    const message = awardMessage({ status: "not_eligible", reason });
    assert.equal(message.tone, "info");
    assert.ok(message.text.length > 0, reason);
  }
});

test("program-disabled message never claims points were given", () => {
  const { text } = awardMessage({ status: "not_eligible", reason: "program_disabled" });
  assert.doesNotMatch(text, /קיבלת/);
});

test("parseAwardResult accepts server results and rejects anything else", () => {
  assert.deepEqual(parseAwardResult({ status: "not_eligible", reason: "program_disabled" }), {
    status: "not_eligible",
    reason: "program_disabled",
  });
  assert.throws(() => parseAwardResult(null));
  assert.throws(() => parseAwardResult({ status: "hacked", points: 9999 }));
  assert.throws(() => parseAwardResult("awarded"));
});
