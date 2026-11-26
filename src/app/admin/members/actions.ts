"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function deleteMember(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_member", { p_user: id });
  revalidatePath("/admin/members");
  if (!error) redirect("/admin/members?result=deleted");
  if (error.message.includes("business")) redirect("/admin/members?result=business");
  if (error.code === "23503") redirect("/admin/members?result=history");
  if (error.code === "22023") redirect("/admin/members?result=admin");
  redirect("/admin/members?result=failed");
}
