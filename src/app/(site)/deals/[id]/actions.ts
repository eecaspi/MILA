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
