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
    if (overflow > 1) problems.push(`${vp.name} ${path}: scrolls sideways by ${overflow}px`);
    for (const e of errors) problems.push(`${vp.name} ${path}: console error: ${e}`);

    const file = `screenshots/${vp.name}${path === "/" ? "-home" : path.replaceAll("/", "-")}.png`;
    await page.screenshot({ path: file, fullPage: true });
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
