import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Stores (or removes) a device's notification subscription. No names or accounts are attached. */
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown }; unsubscribe?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) return NextResponse.json({ ok: false }, { status: 400 });

  if (body.unsubscribe === true) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
  }

  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  if (p256dh.length < 20 || p256dh.length > 200 || auth.length < 10 || auth.length > 100) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { error } = await supabase.from("push_subscriptions").upsert({ endpoint, p256dh, auth }, { onConflict: "endpoint" });
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
