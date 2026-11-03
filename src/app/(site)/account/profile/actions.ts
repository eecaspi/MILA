"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { notify } from "@/lib/notifications";
import { parseAwardResult } from "@/lib/rewards/format";
import { createClient } from "@/lib/supabase/server";

const MAX = 60;

function clean(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, MAX) : "";
}

export async function updateProfile(formData: FormData): Promise<void> {
  const session = await requireSession("/account/profile");
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: clean(formData, "display_name") || null,
      city: clean(formData, "city") || null,
    })
    .eq("id", session.userId);
  if (error) redirect("/account/profile?error=save_failed");

  // The database decides whether the profile qualifies; nothing from the form is trusted.
  const { data, error: claimError } = await supabase.rpc("claim_profile_completion");
  if (claimError) redirect("/account/profile?notice=saved");

  const result = parseAwardResult(data);
  if (result.status === "awarded") {
    await notify({ type: "points_awarded", userId: session.userId, points: result.points });
  }
  redirect(
    `/account/profile?result=${result.status === "not_eligible" ? result.reason : result.status}`,
  );
}
