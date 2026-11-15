import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/** Stores a device's notification subscription. No names or accounts are attached. */
export async function POST(request: NextRequest) {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) return NextResponse.json({ ok: false }, { status: 400 });

  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  if (p256dh.length < 20 || p256dh.length > 200 || auth.length < 10 || auth.length > 100) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { error } = await supabase.from("push_subscriptions").insert({ endpoint, p256dh, auth });
  // 23505: this device is already on the list.
  const ok = !error || error.code === "23505";
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
