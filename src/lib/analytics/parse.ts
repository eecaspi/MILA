/** Pure helpers for privacy-friendly analytics. No I/O. */

export const EVENT_TYPES = [
  "page_view",
  "offer_view",
  "business_view",
  "outbound_click",
  "cta_click",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export function isEventType(v: unknown): v is EventType {
  return typeof v === "string" && (EVENT_TYPES as readonly string[]).includes(v);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function uuidOrNull(v: unknown): string | null {
  return typeof v === "string" && UUID.test(v) ? v : null;
}

/** Coarse device class from the User-Agent. Nothing else from the UA is stored. */
export function deviceFromUserAgent(
  ua: string | null | undefined,
): "mobile" | "tablet" | "desktop" | "other" {
  if (!ua) return "other";
  if (/bot|crawl|spider|preview|headless/i.test(ua)) return "other";
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Just the host of an external referrer; null for direct visits and internal navigation. */
export function referrerHost(referrer: unknown, ownHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    const own = (ownHost ?? "")
      .toLowerCase()
      .replace(/^www\./, "")
      .split(":")[0];
    if (!host || host === own) return null;
    // Group common sources so the dashboard stays readable.
    if (/(^|\.)google\./.test(host)) return "google";
    if (/(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com)$/.test(host))
      return "facebook";
    if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
    if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return "whatsapp";
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

/** Only in-site paths, without query strings, max 300 chars. */
export function cleanPath(path: unknown): string | null {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return null;
  return path.split(/[?#]/)[0]!.slice(0, 300);
}

/** Israel-time calendar day, so the visitor id rotates at local midnight. */
export function israelDay(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
}
