"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

/** Links a registered member (by email) to a business so she can see its dashboard. */
export async function linkOwner(formData: FormData): Promise<void> {
  await requireAdmin();
  const business = String(formData.get("business") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  if (!UUID.test(business)) redirect("/admin/businesses");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_link_business_owner", { p_business: business, p_email: email });
  revalidatePath(`/admin/businesses/${business}`);
  redirect(
    `/admin/businesses/${business}?${error ? (error.message.includes("No member") ? "owner=missing" : "error=1") : "owner=ok"}`,
  );
}

export async function unlinkOwner(formData: FormData): Promise<void> {
  await requireAdmin();
  const business = String(formData.get("business") ?? "");
  const user = String(formData.get("user") ?? "");
  if (!UUID.test(business) || !UUID.test(user)) redirect("/admin/businesses");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_unlink_business_owner", { p_business: business, p_user: user });
  revalidatePath(`/admin/businesses/${business}`);
  redirect(`/admin/businesses/${business}?${error ? "error=1" : "owner=removed"}`);
}
