import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  cleanPath,
  deviceFromUserAgent,
  isEventType,
  israelDay,
  referrerHost,
  uuidOrNull,
} from "@/lib/analytics/parse";
import { supabaseAnonKey } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Receives page views and clicks from the site (sendBeacon). Stores no cookies,
 * no IP address and no user agent: only a daily-rotating anonymous visitor id,
 * a coarse device class and the referrer's host.
 */
export async function POST(request: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  const supabase = createPublicClient();
  if (!supabase) return done;

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  if (!isEventType(body.type)) return done;
  const path = cleanPath(body.path);
  if (!path) return done;

  const ua = request.headers.get("user-agent") ?? "";
  const device = deviceFromUserAgent(ua);
  if (device === "other" && /bot|crawl|spider|headless/i.test(ua)) return done;

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "0.0.0.0";
  const salt = process.env.ANALYTICS_SALT || supabaseAnonKey;
  const visitor = createHash("sha256")
    .update(`${israelDay(new Date())}|${ip}|${ua}|${salt}`)
    .digest("hex")
    .slice(0, 32);

  const { error } = await supabase.rpc("track_event", {
    p_type: body.type,
    p_path: path,
    p_visitor_hash: visitor,
    p_device: device,
    p_business: uuidOrNull(body.businessId),
    p_offer: uuidOrNull(body.offerId),
    p_referrer_host: referrerHost(body.referrer, request.headers.get("host")),
    p_utm_source: typeof body.utm === "string" ? body.utm.slice(0, 60) : null,
  });
  if (error) console.error("track_event failed", error.message);
  return done;
}
