import { test } from "node:test";
import assert from "node:assert/strict";
import {
  imageFile,
  imageFiles,
  keptGallery,
  parseBusinessForm,
  parseOfferForm,
  parseDailyCodes,
  addDays,
  uploadPath,
} from "./validate.ts";

function form(fields: Record<string, string | File>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

test("valid business form is cleaned up", () => {
  const r = parseBusinessForm(
    form({
      name: "  בוטיק נועה ",
      category_slug: "fashion",
      short_description: "אופנה צנועה ומעוצבת",
      website: "noa.co.il",
      tags: "שמלות, חצאיות,, ערב",
      is_published: "on",
      status: "verified",
      pin_first: "on",
    }),
  );
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.values.name, "בוטיק נועה");
  assert.equal(r.values.website, "https://noa.co.il/");
  assert.deepEqual(r.values.tags, ["שמלות", "חצאיות", "ערב"]);
  assert.equal(r.values.is_published, true);
  assert.equal(r.values.status, "verified");
  assert.equal(r.values.sort_order, -1);
});

test("business form reports each problem in Hebrew", () => {
  const r = parseBusinessForm(
    form({
      name: "א",
      category_slug: "cars",
      short_description: "",
      website: "not a site",
      phone: "abc",
    }),
  );
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.deepEqual(Object.keys(r.errors).sort(), [
    "category_slug",
    "name",
    "phone",
    "short_description",
    "website",
  ]);
});

test("unpublished by default; unknown status falls back to listed", () => {
  const r = parseBusinessForm(
    form({
      name: "עסק טוב",
      category_slug: "food",
      short_description: "מאפייה שכונתית",
      status: "demo",
    }),
  );
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.values.is_published, false);
    assert.equal(r.values.status, "listed");
    assert.equal(r.values.sort_order, 0);
  }
});

test("offer form: valid input, code is upper-cased", () => {
  const r = parseOfferForm(
    form({
      business_id: "bbbb0000-0000-0000-0000-000000000001",
      kind: "coupon",
      title: "הנחה לחברות",
      value_label: "20% הנחה",
      valid_until: "2027-01-31",
      coupon_code: "noa20",
      highlight: "on",
    }),
  );
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.values.coupon_code, "NOA20");
    assert.equal(r.values.highlight, true);
    assert.equal(r.values.is_published, false);
  }
});

test("offer form rejects bad input", () => {
  const r = parseOfferForm(
    form({
      business_id: "x",
      title: "",
      value_label: "",
      valid_until: "31/01/2027",
      coupon_code: "קוד",
    }),
  );
  assert.equal(r.ok, false);
  if (!r.ok)
    assert.deepEqual(Object.keys(r.errors).sort(), [
      "business_id",
      "coupon_code",
      "title",
      "valid_until",
      "value_label",
    ]);
});

test("image uploads: type and size are checked", () => {
  const errors: Record<string, string> = {};
  const ok = new File([new Uint8Array(10)], "a.png", { type: "image/png" });
  const pdf = new File([new Uint8Array(10)], "a.pdf", { type: "application/pdf" });
  const big = new File([new Uint8Array(6 * 1024 * 1024)], "b.jpg", { type: "image/jpeg" });
  assert.equal(imageFile(form({ logo: ok }), "logo", errors), ok);
  assert.equal(imageFile(form({ logo: pdf }), "logo", errors), null);
  assert.match(errors.logo ?? "", /תמונה/);
  assert.equal(imageFile(form({ cover: big }), "cover", errors), null);
  assert.match(errors.cover ?? "", /5MB/);
  assert.equal(imageFile(form({}), "none", errors), null);
  assert.equal(uploadPath("businesses", "id1", ok, 123), "businesses/id1-123.png");
});

test("gallery: several images, removals and the size limit", () => {
  const errors: Record<string, string> = {};
  const img = () => new File([new Uint8Array(10)], "p.jpg", { type: "image/jpeg" });
  const fd = new FormData();
  fd.append("gallery", img());
  fd.append("gallery", img());
  assert.equal(imageFiles(fd, "gallery", errors).length, 2);
  assert.deepEqual(imageFiles(fd, "gallery", errors, 1), []);
  assert.match(errors.gallery ?? "", /עד 1/);

  const edit = new FormData();
  edit.append("remove_gallery", "https://x/b.jpg");
  assert.deepEqual(keptGallery(["https://x/a.jpg", "https://x/b.jpg"], edit), ["https://x/a.jpg"]);
});

test("daily codes: one per line, one per day, validated", () => {
  const ok = parseDailyCodes(" noa-d1 \n\nNOA-D2\r\nnoa_d3", "2026-11-28");
  assert.deepEqual(ok, {
    codes: [
      { day: "2026-11-28", code: "NOA-D1" },
      { day: "2026-11-29", code: "NOA-D2" },
      { day: "2026-11-30", code: "NOA_D3" },
    ],
  });
  assert.equal(addDays("2026-12-31", 1), "2027-01-01", "crosses a year end");
  assert.ok("error" in parseDailyCodes("OK1\nbad code!", "2026-11-05"));
  assert.ok("error" in parseDailyCodes("AB1\nab1", "2026-11-05"), "duplicates are refused");
  assert.ok("error" in parseDailyCodes(Array.from({ length: 400 }, (_, i) => `C${i}X`).join("\n"), "2026-11-05"));
});

test("offer form: daily mode and pasted codes", () => {
  const r = parseOfferForm(
    form({
      business_id: "bbbb0000-0000-0000-0000-000000000001",
      title: "הנחה",
      value_label: "20% הנחה",
      code_mode: "daily",
      daily_start: "2026-11-10",
      daily_codes: "A1\nA2",
    }),
  );
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.values.code_mode, "daily");
    assert.deepEqual(r.values.daily.map((d) => d.day), ["2026-11-10", "2026-11-11"]);
  }
  const bad = parseOfferForm(
    form({
      business_id: "bbbb0000-0000-0000-0000-000000000001",
      title: "הנחה",
      value_label: "20% הנחה",
      daily_codes: "no good",
    }),
  );
  assert.equal(bad.ok, false);
  const plain = parseOfferForm(
    form({ business_id: "bbbb0000-0000-0000-0000-000000000001", title: "הנחה", value_label: "x" }),
  );
  assert.ok(plain.ok);
  if (plain.ok) {
    assert.equal(plain.values.code_mode, "personal");
    assert.deepEqual(plain.values.daily, []);
  }
});
