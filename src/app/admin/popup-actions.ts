"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
  if (active && !title && !body) return { error: "כדי להפעיל את הפופאפ צריך לכתוב כותרת או טקסט." };
  if (linkUrl && !/^(\/|https?:\/\/)/.test(linkUrl)) return { error: "הקישור צריך להתחיל ב- / או ב- https://" };
  if (buttonLabel && !linkUrl) return { error: "לכפתור צריך להוסיף גם קישור." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_popup")
    .update({
      is_active: active,
      title,
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
