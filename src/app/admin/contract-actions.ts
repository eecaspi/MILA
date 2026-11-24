"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { CONTRACT_VERSION } from "@/lib/contracts/template";
import { createClient } from "@/lib/supabase/server";

export type ContractCreateResult = { error?: string; ok?: boolean };

const text = (fd: FormData, key: string, max: number) =>
  String(fd.get(key) ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export async function createContract(_prev: ContractCreateResult, formData: FormData): Promise<ContractCreateResult> {
  await requireAdmin();
  const label = text(formData, "label", 120);
  const commissionPercent = Number(formData.get("commissionPercent"));
  const paymentDays = Number(formData.get("paymentDays"));
  const noticeDays = Number(formData.get("noticeDays"));
  const courtCity = text(formData, "courtCity", 60);
  if (!label) return { error: "צריך שם עסק." };
  if (!Number.isFinite(commissionPercent) || commissionPercent <= 0 || commissionPercent > 100) {
    return { error: "שיעור העמלה צריך להיות בין 1 ל-100." };
  }
  if (!Number.isInteger(paymentDays) || paymentDays < 0 || paymentDays > 180) return { error: "ימי התשלום לא תקינים." };
  if (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 180) return { error: "ימי ההודעה מראש לא תקינים." };
  if (!courtCity) return { error: "צריך לכתוב עיר לבית המשפט המוסמך." };

  const terms = {
    commissionPercent,
    vat: formData.get("vat") === "with" ? "with" : "without",
    paymentDays,
    reportPeriod: formData.get("reportPeriod") === "biweekly" ? "biweekly" : "monthly",
    noticeDays,
    term: text(formData, "term", 200),
    exposure: text(formData, "exposure", 300),
    courtCity,
  };
  const supabase = await createClient();
  const { error } = await supabase
    .from("business_contracts")
    .insert({ label, terms, template_version: CONTRACT_VERSION });
  if (error) return { error: "יצירת ההסכם נכשלה. ייתכן שהמיגרציה עוד לא הורצה." };
  revalidatePath("/admin/contracts");
  return { ok: true };
}

export async function cancelContract(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("business_contracts").update({ status: "cancelled" }).eq("id", id).eq("status", "sent");
  revalidatePath("/admin/contracts");
}
