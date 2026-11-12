"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function addInvites(names: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  const clean = Array.from(new Set(names.map((n) => n.replace(/[<>]/g, "").trim().slice(0, 40)).filter(Boolean))).slice(0, 100);
  if (clean.length === 0) return {};
  const supabase = await createClient();
  const { error } = await supabase.from("invite_links").upsert(
    clean.map((name) => ({ name })),
    { onConflict: "name", ignoreDuplicates: true },
  );
  if (error) return { error: "השמירה נכשלה. נסי שוב." };
  revalidatePath("/admin/invites");
  return {};
}

export async function deleteInvite(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("invite_links").delete().eq("id", id);
  if (error) return { error: "המחיקה נכשלה. נסי שוב." };
  revalidatePath("/admin/invites");
  return {};
}
