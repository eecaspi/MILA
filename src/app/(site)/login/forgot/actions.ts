"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Sends a reset link. The answer is the same whether or not the address has an account. */
export async function requestReset(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured) redirect("/login/forgot?error=not_configured");
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email) redirect("/login/forgot?error=missing_email");

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error && error.code === "over_email_send_rate_limit") redirect("/login/forgot?error=rate_limit");
  redirect("/login/forgot?sent=1");
}
