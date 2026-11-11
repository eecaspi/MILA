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
    if (!error) {
      if (next.startsWith("/reset-password")) return NextResponse.redirect(`${origin}/reset-password`);
      // A new member lands on the welcome step (which holds the WhatsApp window for those who chose it).
      const { data } = await supabase.auth.getUser();
      const channel = data.user?.user_metadata?.community_channel;
      if (channel === "whatsapp" || channel === "email") {
        return NextResponse.redirect(`${origin}/welcome?channel=${channel}&next=${encodeURIComponent(next)}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=confirm_failed`);
}
