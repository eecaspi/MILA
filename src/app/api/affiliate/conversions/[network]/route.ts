import { NextResponse, type NextRequest } from "next/server";
import { getAdapter, toRecordConversionArgs, validateEvent } from "@/lib/rewards/conversions";
import { createServiceClient } from "@/lib/supabase/service";

type Params = Promise<{ network: string }>;

/**
 * Webhook for affiliate networks to report purchases.
 * No network is connected yet, so every request gets 501 and nothing is recorded.
 */
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { network } = await params;
  const adapter = getAdapter(network);
  if (!adapter) {
    return NextResponse.json(
      { error: "not_implemented", message: `No integration for network "${network}"` },
      { status: 501 },
    );
  }

  const rawBody = await request.text();
  if (!(await adapter.verify(request, rawBody))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const results: unknown[] = [];
  for (const event of adapter.parse(rawBody)) {
    const problem = validateEvent(event);
    if (problem) {
      results.push({ externalId: event.externalId, error: problem });
      continue;
    }
    const { data, error } = await supabase.rpc(
      "record_conversion",
      toRecordConversionArgs(network, event),
    );
    results.push(error ? { externalId: event.externalId, error: error.message } : data);
  }
  return NextResponse.json({ results });
}
