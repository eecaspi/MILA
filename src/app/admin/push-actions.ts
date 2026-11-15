"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { safeLink } from "@/lib/banners";
import { createClient } from "@/lib/supabase/server";
import { isShabbat, sendPush, vapidKeysFromEnv } from "@/lib/push/webpush";

export type PushSendResult = { error?: string; sent?: number; removed?: number; failed?: number };

export async function sendNotification(_prev: PushSendResult, formData: FormData): Promise<PushSendResult> {
  await requireAdmin();
  const keys = vapidKeysFromEnv();
  if (!keys) return { error: "מפתחות ההתראות עוד לא הוגדרו ב-Vercel." };
  if (isShabbat() && formData.get("confirmShabbat") !== "on") {
    return { error: "עכשיו שבת (מיום שישי אחר הצהריים עד מוצאי שבת). סמני את תיבת האישור אם בכל זאת צריך לשלוח." };
  }

  const title = String(formData.get("title") ?? "").replace(/[<>]/g, "").trim().slice(0, 60);
  const body = String(formData.get("body") ?? "").replace(/[<>]/g, "").trim().slice(0, 160);
  const rawUrl = String(formData.get("url") ?? "").trim();
  const link = rawUrl ? safeLink(rawUrl) : "/deals";
  if (!title || !body) return { error: "צריך כותרת ותוכן." };
  if (link === undefined) return { error: "הקישור צריך להתחיל ב-/ (עמוד באתר) או ב-https." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (error) return { error: "קריאת הרשימה נכשלה." };
  const subs = data ?? [];
  if (subs.length === 0) return { error: "עוד אין מכשירים רשומים." };

  let sent = 0;
  let failed = 0;
  const gone: string[] = [];
  for (let i = 0; i < subs.length; i += 20) {
    const batch = subs.slice(i, i + 20);
    const results = await Promise.all(
      batch.map((s) =>
        sendPush(
          { endpoint: s.endpoint as string, p256dh: s.p256dh as string, auth: s.auth as string },
          { title, body, url: link ?? "/deals" },
          keys,
        ),
      ),
    );
    results.forEach((r, idx) => {
      if (r === "sent") sent++;
      else if (r === "gone") gone.push(batch[idx].id as string);
      else failed++;
    });
  }
  if (gone.length > 0) await supabase.from("push_subscriptions").delete().in("id", gone);
  revalidatePath("/admin/notifications");
  return { sent, removed: gone.length, failed };
}
