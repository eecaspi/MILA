"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function back(mode: "login" | "signup", code: string, next: string): never {
  redirect(`/login?mode=${mode}&error=${code}&next=${encodeURIComponent(next)}`);
}

export async function signIn(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  if (!isSupabaseConfigured) back("login", "not_configured", next);

  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || !password) back("login", "missing_fields", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    back("login", error.code === "invalid_credentials" ? "invalid_credentials" : "unknown", next);

  redirect(next);
}

export async function signUp(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  if (!isSupabaseConfigured) back("signup", "not_configured", next);

  const displayName = field(formData, "display_name");
  const email = field(formData, "email");
  const password = field(formData, "password");
  if (!email || !password) back("signup", "missing_fields", next);
  if (password.length < 8) back("signup", "weak_password", next);

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    back(
      "signup",
      error.code === "user_already_exists"
        ? "email_taken"
        : error.code === "weak_password"
          ? "weak_password"
          : "unknown",
      next,
    );
  }
  // With email confirmation on (Supabase default), there is no session until the link is clicked.
  if (!data.session) redirect("/login?notice=check_email");
  redirect(next);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login?notice=signed_out");
}
