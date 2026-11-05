import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export interface HomeBanner {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  link?: string;
}

async function fetchBanners(): Promise<HomeBanner[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);
  if (error || !data) return []; // e.g. the table doesn't exist yet: the home page just shows the brand slide
  return data.map((r) => ({
    id: r.id as string,
    url: r.media_url as string,
    type: r.media_type === "video" ? "video" : "image",
    title: (r.title as string | null) ?? undefined,
    link: (r.link_url as string | null) ?? undefined,
  }));
}

/** Published home banners in display order. Cached for a minute, cleared when the back office saves. */
export const getBanners = unstable_cache(fetchBanners, ["home-banners"], {
  revalidate: 60,
  tags: ["content"],
});
