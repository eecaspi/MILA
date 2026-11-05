import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getOffers } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

/** Public pages for search engines: fixed pages and every live offer. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const fixed = ["", "/deals", "/businesses", "/community", "/about", "/terms", "/privacy", "/disclosure", "/accessibility"];
  const entries: MetadataRoute.Sitemap = fixed.map((path) => ({ url: `${base}${path}` }));
  try {
    const offers = await getOffers();
    for (const o of offers) if (o.status !== "demo") entries.push({ url: `${base}/deals/${o.id}` });
  } catch {
    // The fixed pages are still useful if content can't be loaded.
  }
  return entries;
}
