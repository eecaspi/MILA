"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function raw(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function back(code: string): never {
  redirect(`/reset-password?error=${code}`);
}

/** Sets a new password for the member who arrived through the emailed reset link. */
export async function resetPassword(formData: FormData): Promise<void> {
  await requireSession("/login/forgot");
  const next = raw(formData, "next");
  const confirm = raw(formData, "confirm");

  if (!next) back("missing_fields_password");
  if (next.length < 8) back("weak_password");
  if (next !== confirm) back("password_mismatch");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) back(error.code === "weak_password" ? "weak_password" : error.code === "same_password" ? "same_password" : "unknown");

  redirect("/account?password_reset=1");
}
