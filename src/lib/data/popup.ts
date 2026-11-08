import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export interface SitePopup {
  title: string;
  imageUrl: string;
  body: string;
  buttonLabel: string;
  linkUrl: string;
  version: string;
}

/** The active entry popup, or null. Cached for a minute, cleared when the back office saves. */
export const getPopup = unstable_cache(fetchPopup, ["site-popup"], { revalidate: 60, tags: ["content"] });

async function fetchPopup(): Promise<SitePopup | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_popup")
    .select("is_active, title, body, button_label, link_url, image_url, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data || !data.is_active || !(data.title || data.body || data.image_url)) return null;
  return {
    title: data.title,
    imageUrl: data.image_url ?? "",
    body: data.body,
    buttonLabel: data.button_label,
    linkUrl: data.link_url,
    version: String(data.updated_at),
  };
}
