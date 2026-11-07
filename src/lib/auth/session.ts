import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  city: string | null;
  role: "member" | "business_owner" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Session {
  userId: string;
  email: string | null;
  profile: Profile;
}

/**
 * The signed-in member, or null. Always verified with Supabase Auth on the server.
 * Cached per request, so the header and the page share one lookup.
 */
export const getSession = cache(async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, city, role, created_at, updated_at")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, email: user.email ?? null, profile: profile as Profile };
});

/** For member-only pages and actions: redirects to login when signed out. */
export async function requireSession(returnTo: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/**
 * For admin pages and actions. Non-admins get a 404 so the admin area is not advertised.
 * The database checks admin rights again inside every admin function.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.profile.role !== "admin") notFound();
  return session;
}

/** Only allow relative in-site redirects after login (prevents open redirects). */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
