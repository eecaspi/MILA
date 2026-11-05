"use server";

import { redirect } from "next/navigation";
import { parseInquiry } from "@/lib/inquiry";
import { createClient } from "@/lib/supabase/server";

export async function submitInquiry(formData: FormData): Promise<void> {
  // A hidden field that real visitors never fill in; bots do.
  if (String(formData.get("website_url") ?? "") !== "") redirect("/for-businesses?sent=1");
  if (formData.get("consent") !== "yes") redirect("/for-businesses?error=consent");

  const parsed = parseInquiry(Object.fromEntries(formData));
  if (!parsed.ok) redirect(`/for-businesses?error=${parsed.error}`);
  const v = parsed.value;

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_business_inquiry", {
    p_business: v.business,
    p_name: v.name,
    p_phone: v.phone,
    p_email: v.email,
    p_website: v.website,
    p_message: v.message,
    p_consent: true,
  });
  if (error) redirect("/for-businesses?error=failed");
  redirect("/for-businesses?sent=1");
}
