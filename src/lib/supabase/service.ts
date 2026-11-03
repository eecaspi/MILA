import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * Service-role client for trusted server-to-server work (affiliate webhooks).
 * Bypasses row level security — never use it with input you have not verified,
 * and never import it from code that runs in the browser.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
