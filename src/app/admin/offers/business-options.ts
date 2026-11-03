import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Real businesses (published or draft) for the offer form's select. */
export async function businessOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("is_real_business", true)
    .order("name");
  return (data ?? []) as { id: string; name: string }[];
}
