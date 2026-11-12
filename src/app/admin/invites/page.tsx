import { InviteLinkMaker } from "@/components/admin/InviteLinkMaker";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "קישורי הזמנה" };

export default async function InvitesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("invite_links").select("id, name").order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-ink">קישורי הזמנה</h1>
      <p className="max-w-xl text-ink-soft">
        כותבות שם בכל שורה ושומרות. הלקוחות נשמרים כאן, ולכל אחד יש קישור להעתקה. מי שנכנס מהקישור רואה ברכת קבלה אישית עם השם בכל כניסה חדשה לאתר, עד שנפתח אותו סופית. האתר עצמו נשאר פתוח לכולן.
      </p>
      <InviteLinkMaker saved={(data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))} />
    </div>
  );
}
