"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Creates (or returns) the signed-in member's personal one-day code for an offer.
 * The database enforces everything: sign-in, offer availability, 3 live codes at most.
 */
export async function claimCode(formData: FormData): Promise<void> {
  const raw = formData.get("offer_id");
  const offerId = typeof raw === "string" && UUID.test(raw) ? raw : null;
  if (!offerId || !siteConfig.features.personalCodes) redirect("/deals");

  const here = `/deals/${offerId}`;
  const session = await getSession();
  if (!session) redirect(`/login?mode=signup&next=${encodeURIComponent(here)}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_offer_code", { p_offer_id: offerId });
  if (!error) redirect(here);
  redirect(
    `${here}?claim=${error.code === "54000" ? "limit" : error.code === "P0002" ? "unavailable" : "failed"}`,
  );
}

export interface CardCodeState {
  code?: string;
  expiresAt?: string;
  error?: "limit" | "unavailable" | "failed" | "signin";
}

/** Same as claimCode, but answers in place (no page change): used by the button on offer cards. */
export async function claimCodeInline(
  _prev: CardCodeState,
  formData: FormData,
): Promise<CardCodeState> {
  const raw = formData.get("offer_id");
  const offerId = typeof raw === "string" && UUID.test(raw) ? raw : null;
  if (!offerId || !siteConfig.features.personalCodes) return { error: "failed" };
  if (!(await getSession())) return { error: "signin" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_offer_code", { p_offer_id: offerId });
  if (error) {
    return { error: error.code === "54000" ? "limit" : error.code === "P0002" ? "unavailable" : "failed" };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { claim_code?: string; claim_expires_at?: string }
    | undefined;
  if (!row?.claim_code) return { error: "failed" };
  return { code: row.claim_code, expiresAt: row.claim_expires_at };
}
