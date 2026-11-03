import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Email-confirmation landing: exchanges the one-time code for a session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (isSupabaseConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=confirm_failed`);
}
