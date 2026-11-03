import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanPath,
  deviceFromUserAgent,
  isEventType,
  israelDay,
  referrerHost,
  uuidOrNull,
} from "./parse.ts";

test("device classes from common user agents", () => {
  assert.equal(
    deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148"),
    "mobile",
  );
  assert.equal(
    deviceFromUserAgent("Mozilla/5.0 (Linux; Android 14; SM-S918B) Mobile Safari/537.36"),
    "mobile",
  );
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "tablet");
  assert.equal(
    deviceFromUserAgent("Mozilla/5.0 (Linux; Android 13; SM-X700) Safari/537.36"),
    "tablet",
  );
  assert.equal(
    deviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130"),
    "desktop",
  );
  assert.equal(deviceFromUserAgent("Googlebot/2.1"), "other");
  assert.equal(deviceFromUserAgent(null), "other");
});

test("referrers are reduced to a host, grouped, and internal ones dropped", () => {
  assert.equal(referrerHost("https://www.google.co.il/search?q=x", "likey.co.il"), "google");
  assert.equal(referrerHost("https://l.facebook.com/l.php?u=x", "likey.co.il"), "facebook");
  assert.equal(referrerHost("https://www.instagram.com/", "likey.co.il"), "instagram");
  assert.equal(referrerHost("https://likey.co.il/deals", "likey.co.il"), null);
  assert.equal(referrerHost("https://blog.example.com/a", "likey.co.il"), "blog.example.com");
  assert.equal(referrerHost("not a url", "x"), null);
  assert.equal(referrerHost("", "x"), null);
});

test("paths are in-site only and lose their query string", () => {
  assert.equal(cleanPath("/deals?utm_source=x#top"), "/deals");
  assert.equal(cleanPath("https://evil.example/"), null);
  assert.equal(cleanPath("//evil.example"), null);
  assert.equal(cleanPath(42), null);
});

test("event types and ids are validated", () => {
  assert.equal(isEventType("page_view"), true);
  assert.equal(isEventType("delete_everything"), false);
  assert.equal(
    uuidOrNull("bbbb0000-0000-0000-0000-000000000001"),
    "bbbb0000-0000-0000-0000-000000000001",
  );
  assert.equal(uuidOrNull("'; drop table x; --"), null);
});

test("visitor day rotates at Israel midnight", () => {
  assert.equal(israelDay(new Date("2026-11-03T21:30:00Z")), "2026-11-03"); // 23:30 in Israel
  assert.equal(israelDay(new Date("2026-11-03T22:30:00Z")), "2026-11-04"); // 00:30 in Israel
});
