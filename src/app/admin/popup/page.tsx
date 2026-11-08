import { PopupForm } from "@/components/admin/PopupForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPopup() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_popup")
    .select("is_active, title, body, button_label, link_url, image_url")
    .eq("id", 1)
    .maybeSingle();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">פופאפ בכניסה לאתר</h1>
      <p className="max-w-xl text-sm text-ink-soft">
        חלון שקופץ מיד בכניסה לאתר, עם X לסגירה. כל מבקרת רואה אותו פעם אחת, ואם תשני את התוכן הוא יוצג שוב.
      </p>
      {error && <p role="alert" className="text-sm text-danger">צריך להריץ את עדכון מסד הנתונים של הפופאפ.</p>}
      <PopupForm
        values={{
          is_active: data?.is_active ?? false,
          title: data?.title ?? "",
          body: data?.body ?? "",
          button_label: data?.button_label ?? "",
          link_url: data?.link_url ?? "",
          image_url: data?.image_url ?? "",
        }}
      />
    </div>
  );
}
