import "server-only";

import { unstable_cache } from "next/cache";
import { toCaptionPos, toMediaScale, type BannerLayout, type CaptionPos } from "@/lib/banners";
import { createPublicClient } from "@/lib/supabase/public";

export interface HomeBanner {
  id: string;
  url: string;
  type: "image" | "video";
  layout: BannerLayout;
  pos?: CaptionPos;
  scale?: number;
  mobileUrl?: string;
  mobileScale?: number;
  title?: string;
  headline?: string;
  text?: string;
  cta?: string;
  link?: string;
  cta2?: string;
  link2?: string;
}

/** The Liky slides, used only when the banners can't be read from the database at all. */
const defaults: HomeBanner[] = [
  {
    id: "d1", url: "/brand/liky-character-bag.jpg", type: "image", layout: "character",
    title: "ליקי עם שקית של האתר", headline: "היי, אני ליקי",
    text: "כאן לשירותך, עם ההטבות והמבצעים הכי שווים במקום אחד.", cta: "בואי לראות מה מצאתי לך", link: "/deals",
  },
  {
    id: "d2", url: "/brand/liky-banner-red.jpg", type: "image", layout: "cover",
    title: "ליקי, יש לי קישור בשבילך", cta: "בואי לראות מה מצאתי לך", link: "/deals",
  },
  {
    id: "d3", url: "/brand/liky-presenting.jpg", type: "image", layout: "character",
    title: "ליקי מציגה שקית של האתר", headline: "יש לי קישור בשבילך.",
    text: "מצטרפות בחינם ומקבלות קוד קופון להטבות של העסקים.", cta: "אני רוצה להצטרף", link: "/login?mode=signup",
  },
  {
    id: "d4", url: "/brand/liky-podcast.jpg", type: "image", layout: "character_reverse",
    title: "ליקי מספרת על ההטבות", headline: "בואי להצטרף לקהילה של ליקי",
    text: "הקבוצה שלנו בוואטסאפ: הטבות חדשות והמלצות ישר לטלפון.", cta: "הצטרפי לקהילה", link: "/community",
  },
];

type Row = Record<string, unknown>;

function toBanner(r: Row): HomeBanner {
  const s = (k: string) => (r[k] as string | null | undefined) || undefined;
  const layout = s("layout");
  return {
    id: r.id as string,
    url: r.media_url as string,
    type: r.media_type === "video" ? "video" : "image",
    layout: layout === "character" || layout === "character_reverse" || layout === "cover" || layout === "chat" ? layout : "photo",
    title: s("title"),
    pos: toCaptionPos(r.caption_pos),
    scale: toMediaScale(r.media_scale),
    mobileUrl: s("mobile_url"),
    mobileScale: toMediaScale(r.mobile_scale),
    headline: s("headline"),
    text: s("body"),
    cta: s("button_label"),
    link: s("link_url"),
    cta2: s("button2_label"),
    link2: s("link2_url"),
  };
}

async function fetchBanners(): Promise<HomeBanner[]> {
  const supabase = createPublicClient();
  if (!supabase) return defaults;
  const order = { ascending: true };
  const withSecond = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url, layout, headline, body, button_label, button2_label, link2_url, caption_pos, media_scale, mobile_url, mobile_scale")
    .order("sort_order", order)
    .order("created_at", { ascending: false })
    .limit(12);
  if (!withSecond.error && withSecond.data) return withSecond.data.map(toBanner);

  const full = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url, layout, headline, body, button_label, caption_pos, media_scale, mobile_url, mobile_scale")
    .order("sort_order", order)
    .order("created_at", { ascending: false })
    .limit(12);
  if (!full.error && full.data) return full.data.map(toBanner);

  // The latest database update isn't applied yet: the banners without the new fields, after the Liky slides.
  const legacy = await supabase
    .from("banners")
    .select("id, media_url, media_type, title, link_url")
    .order("sort_order", order)
    .order("created_at", { ascending: false })
    .limit(12);
  return [...defaults, ...(legacy.error || !legacy.data ? [] : legacy.data.map(toBanner))];
}

/** Published home banners in display order. Cached for a minute, cleared when the back office saves. */
export const getBanners = unstable_cache(fetchBanners, ["home-banners"], {
  revalidate: 60,
  tags: ["content"],
});
