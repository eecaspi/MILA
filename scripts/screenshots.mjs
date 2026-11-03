// Visual smoke test: screenshots key pages at phone and desktop width and fails
// if any page scrolls sideways on a phone or logs a console error.
// Usage (needs `playwright` installed and the app running): node scripts/screenshots.mjs [baseUrl]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const pages = ["/", "/deals", "/deals/offer-boutique-season", "/businesses", "/community", "/login", "/brand"];
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
    if (!res || res.status() >= 400) problems.push(`${vp.name} ${path}: HTTP ${res?.status()}`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) {
      // Name the elements that stick out, so the fix is obvious.
      const culprits = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || (r.left >= -1 && r.right <= w + 1)) continue;
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox !== "visible") { clipped = true; break; }
          }
          if (clipped) continue;
          const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
          out.push(`<${el.tagName.toLowerCase()} class="${cls}"> "${(el.textContent || "").trim().slice(0, 40)}" left=${Math.round(r.left)} right=${Math.round(r.right)}`);
        }
        return out.slice(0, 5);
      });
      problems.push(`${vp.name} ${path}: scrolls sideways by ${overflow}px\n      ${culprits.join("\n      ")}`);
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
