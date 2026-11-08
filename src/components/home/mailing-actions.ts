"use server";

import { createClient } from "@/lib/supabase/server";

export type MailingState = { status: "idle" | "sent" | "error"; message?: string };

function clean(value: FormDataEntryValue | null, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function joinMailingList(_prev: MailingState, formData: FormData): Promise<MailingState> {
  // A hidden field that real visitors never fill in; bots do.
  if (clean(formData.get("website_url"), 50) !== "") return { status: "sent" };
  if (formData.get("consent") !== "yes") {
    return { status: "error", message: "צריך לאשר קבלת דיוור כדי להצטרף." };
  }
  const name = clean(formData.get("name"), 80);
  const email = clean(formData.get("email"), 120);
  if (!name) return { status: "error", message: "נא למלא שם." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "כתובת המייל לא נראית תקינה." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_mailing_list", { p_name: name, p_email: email, p_consent: true });
  if (error) return { status: "error", message: "משהו השתבש, אפשר לנסות שוב בעוד רגע." };
  return { status: "sent" };
}
