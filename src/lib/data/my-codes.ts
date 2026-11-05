import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface MyCode {
  code: string;
  expiresAt: string;
}

/** The signed-in member's live personal codes, keyed by offer id. Row-level security shows only her own. */
export async function getMyCodes(): Promise<Record<string, MyCode>> {
  if (!(await getSession())) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("code_claims")
      .select("offer_id, code, expires_at")
      .gt("expires_at", new Date().toISOString());
    const out: Record<string, MyCode> = {};
    for (const r of data ?? []) {
      out[r.offer_id as string] = { code: r.code as string, expiresAt: r.expires_at as string };
    }
    return out;
  } catch {
    return {};
  }
}
