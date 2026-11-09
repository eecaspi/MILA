"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { bannerStoragePath, parseBannerForm } from "@/lib/banners";
import { supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface BannerState {
  ok?: boolean;
  error?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refresh() {
  revalidateTag("content");
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners");
}

function idFrom(fd: FormData): string | null {
  const v = fd.get("id");
  return typeof v === "string" && UUID.test(v) ? v : null;
}

/** The file is already uploaded (straight from the browser); this saves the banner row. */
export async function createBanner(fd: FormData): Promise<BannerState> {
  await requireAdmin();
  const parsed = parseBannerForm(fd, supabaseUrl);
  if (!parsed.ok) return { error: Object.values(parsed.errors)[0] };
  const supabase = await createClient();
  const { error } = await supabase.from("banners").insert(parsed.values);
  if (error) return { error: "השמירה נכשלה. נסי שוב בעוד רגע." };
  refresh();
  return { ok: true };
}

/** Title, link, order and visibility of an existing banner (the file itself is not replaced). */
export async function updateBanner(_prev: BannerState, fd: FormData): Promise<BannerState> {
  await requireAdmin();
  const id = idFrom(fd);
  if (!id) return { error: "הבאנר לא נמצא." };
  const supabase = await createClient();
  const { data: current } = await supabase.from("banners").select("media_url, media_type").eq("id", id).maybeSingle();
  if (!current) return { error: "הבאנר לא נמצא." };
  const merged = new FormData();
  for (const [k, v] of fd.entries()) merged.append(k, v);
  const newUrl = fd.get("new_media_url");
  const replacing = typeof newUrl === "string" && newUrl !== "" && newUrl !== current.media_url;
  if (!replacing) {
    merged.set("media_url", current.media_url as string);
    merged.set("media_type", current.media_type as string);
  } else {
    merged.set("media_url", newUrl as string);
  }
  const parsed = parseBannerForm(merged, supabaseUrl);
  if (!parsed.ok) return { error: Object.values(parsed.errors)[0] };
  const { media_url, media_type, title, link_url, sort_order, is_published, layout, headline, body, button_label, caption_pos, media_scale } = parsed.values;
  const { error } = await supabase
    .from("banners")
    .update({ ...(replacing ? { media_url, media_type } : {}), title, link_url, sort_order, is_published, layout, headline, body, button_label, caption_pos, media_scale })
    .eq("id", id);
  if (error) return { error: "השמירה נכשלה. נסי שוב בעוד רגע." };
  if (replacing) {
    const oldPath = bannerStoragePath(current.media_url as string, supabaseUrl);
    if (oldPath) await supabase.storage.from("media").remove([oldPath]); // best effort
  }
  refresh();
  return { ok: true };
}

export async function deleteBanner(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(fd);
  if (!id) return;
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("media_url").eq("id", id).maybeSingle();
  await supabase.from("banners").delete().eq("id", id);
  const path = data ? bannerStoragePath(data.media_url as string, supabaseUrl) : null;
  if (path) await supabase.storage.from("media").remove([path]); // best effort
  refresh();
}
