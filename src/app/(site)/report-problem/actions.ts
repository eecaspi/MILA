"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function submitReport(formData: FormData): Promise<void> {
  // A hidden field that real visitors never fill in; bots do.
  if (clean(formData.get("website_url"), 50) !== "") redirect("/report-problem?sent=1");
  if (formData.get("consent") !== "yes") redirect("/report-problem?error=consent");

  const contact = clean(formData.get("contact"), 120);
  const message = clean(formData.get("message"), 1500);
  if (contact.length < 5 || !message) redirect("/report-problem?error=missing");
  const page = clean(formData.get("page"), 300);

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_problem_report", {
    p_name: clean(formData.get("name"), 80),
    p_contact: contact,
    p_message: message,
    p_page: page.startsWith("/") ? page : "",
  });
  if (error) redirect("/report-problem?error=failed");
  redirect("/report-problem?sent=1");
}
