import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell, toCsv } from "./csv.ts";

test("csv cells are quoted and escaped", () => {
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell("שלום, עולם"), '"שלום, עולם"');
});

test("cells that look like formulas are neutralised", () => {
  assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
  assert.equal(csvCell("+1"), `"'+1"`);
  assert.equal(csvCell("@x"), `"'@x"`);
});

test("csv starts with a BOM and ends each row with CRLF", () => {
  const out = toCsv([["a", "b"], ["c", "d"]]);
  assert.ok(out.startsWith("﻿"));
  assert.equal(out.split("\r\n").length, 3);
});
