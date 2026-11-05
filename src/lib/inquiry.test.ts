import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInquiry } from "./inquiry.ts";

const base = { business: "חנות", name: "דנה", phone: "050-1234567", email: "", website: "", message: "" };

test("accepts a minimal inquiry", () => {
  const r = parseInquiry(base);
  assert.equal(r.ok, true);
});

test("requires business, name and phone", () => {
  assert.deepEqual(parseInquiry({ ...base, name: " " }), { ok: false, error: "missing" });
  assert.deepEqual(parseInquiry({ ...base, business: "" }), { ok: false, error: "missing" });
});

test("rejects a bad phone, email and website", () => {
  assert.deepEqual(parseInquiry({ ...base, phone: "abc" }), { ok: false, error: "phone" });
  assert.deepEqual(parseInquiry({ ...base, phone: "123" }), { ok: false, error: "phone" });
  assert.deepEqual(parseInquiry({ ...base, email: "nope" }), { ok: false, error: "email" });
  assert.deepEqual(parseInquiry({ ...base, website: "javascript:alert(1)" }), { ok: false, error: "website" });
});

test("trims and limits lengths", () => {
  const r = parseInquiry({ ...base, message: "x".repeat(2000) });
  assert.ok(r.ok && r.value.message.length === 1000);
});
