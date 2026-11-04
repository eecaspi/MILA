"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function raw(formData: FormData, name: string): string {
  // Passwords are used exactly as typed: no trimming.
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function back(code: string): never {
  redirect(`/account/password?error=${code}`);
}

export async function changePassword(formData: FormData): Promise<void> {
  const session = await requireSession("/account/password");
  const current = raw(formData, "current");
  const next = raw(formData, "next");
  const confirm = raw(formData, "confirm");

  if (!current || !next) back("missing_fields_password");
  if (next.length < 8) back("weak_password");
  if (next !== confirm) back("password_mismatch");
  if (next === current) back("same_password");
  if (!session.email) back("unknown");

  const supabase = await createClient();
  // The current password is checked again, so a session left open on a shared
  // computer can't be used to take over the account.
  const check = await supabase.auth.signInWithPassword({ email: session.email, password: current });
  if (check.error) back("wrong_current_password");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) back(error.code === "weak_password" ? "weak_password" : "unknown");

  redirect("/account/password?ok=1");
}
