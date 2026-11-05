import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedMedia, bannerStoragePath, parseBannerForm, safeLink } from "./banners.ts";

const base = "https://abc.supabase.co";
const file = `${base}/storage/v1/object/public/media/banners/x1.jpg`;

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

test("links stay on the site or go to https", () => {
  assert.equal(safeLink(""), null);
  assert.equal(safeLink("/deals"), "/deals");
  assert.equal(safeLink("//evil.com"), undefined);
  assert.equal(safeLink("javascript:alert(1)"), undefined);
  assert.equal(safeLink("http://noa.co.il"), undefined);
  assert.equal(safeLink("https://noa.co.il/sale"), "https://noa.co.il/sale");
});

test("only files from our own banner folder are accepted", () => {
  assert.equal(bannerStoragePath(file, base), "banners/x1.jpg");
  assert.equal(bannerStoragePath("https://evil.com/x.jpg", base), null);
  assert.equal(bannerStoragePath(`${base}/storage/v1/object/public/media/businesses/x.jpg`, base), null);
});

test("banner form: clean values and clear errors", () => {
  const ok = parseBannerForm(
    form({ media_url: file, media_type: "image", title: " קולקציה חדשה ", link_url: "/deals", sort_order: "2" }),
    base,
  );
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.values.title, "קולקציה חדשה");
    assert.equal(ok.values.sort_order, 2);
    assert.equal(ok.values.is_published, true);
  }
  assert.equal(parseBannerForm(form({ media_url: "https://evil.com/a.jpg", media_type: "image" }), base).ok, false);
  assert.equal(parseBannerForm(form({ media_url: file, media_type: "gif" }), base).ok, false);
  assert.equal(parseBannerForm(form({ media_url: file, media_type: "image", link_url: "ftp://x" }), base).ok, false);
  assert.equal(parseBannerForm(form({ media_url: file, media_type: "image", sort_order: "1.5" }), base).ok, false);
});

test("brand pictures and layouts", () => {
  assert.equal(isAllowedMedia("/brand/liky-podcast.jpg", base), true);
  assert.equal(isAllowedMedia("/brand/../secret.jpg", base), false);
  assert.equal(isAllowedMedia("/other/x.jpg", base), false);
  const ok = parseBannerForm(
    form({ media_url: file, media_type: "image", layout: "character", headline: " היי ", body: "טקסט", button_label: "לחצי" }),
    base,
  );
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.values.layout, "character");
    assert.equal(ok.values.headline, "היי");
    assert.equal(ok.values.button_label, "לחצי");
  }
  assert.equal(parseBannerForm(form({ media_url: file, media_type: "image", layout: "wide" }), base).ok, false);
  const def = parseBannerForm(form({ media_url: file, media_type: "image" }), base);
  assert.ok(def.ok && def.values.layout === "photo");
});
