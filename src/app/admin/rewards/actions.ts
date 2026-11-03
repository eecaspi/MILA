"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/*
 * Admin rewards actions. Each one re-checks admin rights here (actions are
 * public endpoints), then calls a database function that checks them again,
 * validates the operation and writes the audit log in the same transaction.
 */

function str(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function returnTo(formData: FormData): string {
  const path = str(formData, "return_to");
  return path.startsWith("/admin/") ? path : "/admin/rewards";
}

/** Maps database errors to the message codes shown on the page. */
function errorCode(message: string): string {
  if (message.includes("Insufficient points")) return "insufficient";
  if (message.includes("reason is required")) return "reason_required";
  if (message.includes("not verifiable")) return "not_implemented";
  if (message.includes("cannot be reversed") || message.includes("already cancelled"))
    return "not_reversible";
  if (message.includes("cannot go from") || message.includes("is already"))
    return "invalid_transition";
  return "failed";
}

async function run(formData: FormData, fn: string, args: Record<string, unknown>): Promise<never> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  const path = returnTo(formData);
  const sep = path.includes("?") ? "&" : "?";
  revalidatePath("/admin", "layout");
  redirect(error ? `${path}${sep}error=${errorCode(error.message)}` : `${path}${sep}ok=1`);
}

export async function setProgramEnabled(formData: FormData): Promise<void> {
  await run(formData, "admin_set_program_enabled", {
    p_enabled: str(formData, "enabled") === "true",
  });
}

export async function setRuleActive(formData: FormData): Promise<void> {
  await run(formData, "admin_set_rule_active", {
    p_rule: str(formData, "rule_id"),
    p_active: str(formData, "active") === "true",
  });
}

export async function adjustPoints(formData: FormData): Promise<void> {
  const amount = Number.parseInt(str(formData, "amount"), 10);
  if (!Number.isSafeInteger(amount) || amount === 0) {
    redirect(`${returnTo(formData)}?error=invalid_amount`);
  }
  await run(formData, "admin_adjust_points", {
    p_user: str(formData, "user_id"),
    p_amount: amount,
    p_reason: str(formData, "reason"),
    // generated when the form was rendered, so a double submit applies once
    p_request_id: str(formData, "request_id"),
  });
}

export async function reverseTransaction(formData: FormData): Promise<void> {
  await run(formData, "admin_reverse_transaction", {
    p_transaction: str(formData, "transaction_id"),
    p_reason: str(formData, "reason"),
  });
}

export async function setConversionStatus(formData: FormData): Promise<void> {
  const status = str(formData, "status");
  if (!["approved", "cancelled", "refunded"].includes(status)) {
    redirect(`${returnTo(formData)}?error=failed`);
  }
  await run(formData, "admin_set_conversion_status", {
    p_conversion: str(formData, "conversion_id"),
    p_status: status,
    p_reason: str(formData, "reason"),
  });
}
