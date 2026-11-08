"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function setInquiryHandled(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createClient();
  await supabase.from("business_inquiries").update({ handled: formData.get("handled") === "true" }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

export async function setReportHandled(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createClient();
  await supabase.from("problem_reports").update({ handled: formData.get("handled") === "true" }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

const STATUSES = ["new", "in_progress", "closed_ok", "closed_no", "problem"];

/** Status and a private note on a business inquiry. "Handled" stays in step for older screens. */
export async function setInquiryStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !STATUSES.includes(status)) return;
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const supabase = await createClient();
  await supabase
    .from("business_inquiries")
    .update({ status, admin_note: note || null, handled: status.startsWith("closed") })
    .eq("id", id);
  revalidatePath("/admin/inquiries");
}
