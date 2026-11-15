import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.searchIndexing) return { rules: [{ userAgent: "*", disallow: "/" }] };
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/auth", "/api", "/welcome"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
