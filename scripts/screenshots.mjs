// Visual smoke test: screenshots key pages at phone and desktop width and fails
// if any page scrolls sideways on a phone or logs a console error.
// Usage (needs `playwright` installed and the app running): node scripts/screenshots.mjs [baseUrl]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const pages = [
  "/",
  "/deals",
  "/deals/offer-boutique-season",
  "/businesses",
  "/community",
  "/login",
  "/club",
  "/brand",
];
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1366, height: 900, isMobile: false },
];

await mkdir("screenshots", { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    deviceScaleFactor: vp.isMobile ? 2 : 1,
    locale: "he-IL",
  });
  for (const path of pages) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const res = await page.goto(base + path, { waitUntil: "networkidle" });
    // Scroll through the page so lazy-loaded images (footer logo etc.) load before the screenshot.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    if (!res || res.status() >= 400) problems.push(`${vp.name} ${path}: HTTP ${res?.status()}`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) {
      // Name the elements that stick out, so the fix is obvious.
      const culprits = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const out = [];
        const flagged = new Set();
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || (r.left >= -1 && r.right <= w + 1)) continue;
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox !== "visible") {
              clipped = true;
              break;
            }
          }
          if (clipped) continue;
          flagged.add(el);
        }
        // Report the innermost offenders (no flagged descendants): those are the real cause.
        for (const el of flagged) {
          if ([...flagged].some((o) => o !== el && el.contains(o))) continue;
          const r = el.getBoundingClientRect();
          const cls =
            typeof el.className === "string"
              ? el.className.slice(0, 90)
              : String(el.className?.baseVal ?? "");
          out.push(
            `<${el.tagName.toLowerCase()} class="${cls}"> "${(el.textContent || "").trim().slice(0, 40)}" left=${Math.round(r.left)} right=${Math.round(r.right)} width=${Math.round(r.width)}`,
          );
        }
        return out.slice(0, 8);
      });
      problems.push(
        `${vp.name} ${path}: scrolls sideways by ${overflow}px\n      ${culprits.join("\n      ")}`,
      );
    }
    for (const e of errors) problems.push(`${vp.name} ${path}: console error: ${e}`);

    const file = `screenshots/${vp.name}${path === "/" ? "-home" : path.replaceAll("/", "-")}.png`;
    await page.screenshot({ path: file, fullPage: true });
    if (process.env.PRINT_SCREENSHOTS) {
      // Compressed copy in the log, for reviewers who can't download artifacts.
      const jpg = await page.screenshot({ fullPage: true, type: "jpeg", quality: 55 });
      const b64 = jpg.toString("base64");
      console.log(`@@SHOT-BEGIN ${file.replace(".png", ".jpg")}`);
      for (let i = 0; i < b64.length; i += 4000) console.log(`@@ ${b64.slice(i, i + 4000)}`);
      console.log("@@SHOT-END");
    }
    console.log(`✓ ${file}${overflow > 1 ? ` (overflow ${overflow}px)` : ""}`);

    // Interaction states worth reviewing: the business card details (hover / tap).
    if (path === "/businesses") {
      const card = page.locator("main article").first();
      await card.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -120));
      if (vp.isMobile) {
        const more = card.locator("summary");
        if (await more.count()) await more.click();
      } else {
        await card.hover();
      }
      await page.waitForTimeout(500);
      const shot = await page.screenshot({ type: "jpeg", quality: 60 });
      if (process.env.PRINT_SCREENSHOTS) {
        const b64 = shot.toString("base64");
        console.log(`@@SHOT-BEGIN screenshots/${vp.name}-businesses-open.jpg`);
        for (let i = 0; i < b64.length; i += 4000) console.log(`@@ ${b64.slice(i, i + 4000)}`);
        console.log("@@SHOT-END");
      }
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log("\n✓ No sideways scrolling or console errors on any page");
