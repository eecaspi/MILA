import { PushSendForm } from "@/components/admin/PushSendForm";
import { isShabbat, vapidKeysFromEnv } from "@/lib/push/webpush";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "התראות" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { count } = await supabase.from("push_subscriptions").select("id", { count: "exact", head: true });
  const ready = vapidKeysFromEnv() !== null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-ink">התראות</h1>
      <p className="max-w-xl text-ink-soft">
        התראה קצרה שמגיעה למכשירים של מי שהוסיפה את ליקי למסך הבית ואישרה התראות. כדאי לא יותר משתיים־שלוש בשבוע. בשבת ההתראות חסומות כברירת מחדל.
      </p>
      <p className="font-semibold text-ink">מכשירים רשומים: {count ?? 0}</p>
      {ready ? (
        <PushSendForm shabbat={isShabbat()} />
      ) : (
        <p className="max-w-xl rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
          ההתראות עוד לא מופעלות: צריך להוסיף את מפתחות ההתראות ב-Vercel (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT).
        </p>
      )}
    </div>
  );
}
