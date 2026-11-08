"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isAllowedMedia } from "@/lib/banners";
import { supabaseUrl } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface PopupState {
  ok?: boolean;
  error?: string;
}

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function savePopup(_prev: PopupState, fd: FormData): Promise<PopupState> {
  await requireAdmin();
  const active = fd.get("is_active") === "on";
  const title = text(fd, "title", 80);
  const body = text(fd, "body", 300);
  const buttonLabel = text(fd, "button_label", 40);
  const linkUrl = text(fd, "link_url", 300);
  const imageUrl = text(fd, "image_url", 400);
  if (imageUrl && !isAllowedMedia(imageUrl, supabaseUrl)) return { error: "התמונה לא תקינה. נסי להעלות שוב." };
  if (active && !title && !body && !imageUrl) return { error: "כדי להפעיל את הפופאפ צריך לכתוב כותרת, טקסט או תמונה." };
  if (linkUrl && !/^(\/|https?:\/\/)/.test(linkUrl)) return { error: "הקישור צריך להתחיל ב- / או ב- https://" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_popup")
    .update({
      is_active: active,
      title,
      image_url: imageUrl,
      body,
      button_label: buttonLabel,
      link_url: linkUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: "השמירה נכשלה. בדקי שהעדכון למסד הנתונים הורץ." };
  revalidateTag("content");
  revalidatePath("/", "layout");
  revalidatePath("/admin/popup");
  return { ok: true };
}
