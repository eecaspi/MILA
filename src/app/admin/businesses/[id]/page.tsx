import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessForm, type BusinessFormValues } from "@/components/admin/BusinessForm";
import { DangerZone } from "@/components/admin/DangerZone";
import { Alert } from "@/components/ui/Alert";
import { createClient } from "@/lib/supabase/server";
import { deleteBusiness } from "../../content-actions";
import { linkOwner, unlinkOwner } from "./owner-actions";

export default async function EditBusiness({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; owner?: string }>;
}) {
  const [{ id }, { error, owner }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, category_slug, short_description, description, area, branches, city, website, phone, tags, status, is_published, sort_order, logo_url, cover_url, gallery_urls, image_fit",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const business = data as BusinessFormValues & { slug: string };

  const { data: links } = await supabase.from("business_members").select("user_id").eq("business_id", id);
  const ownerIds = (links ?? []).map((l) => l.user_id as string);
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, email, display_name").in("id", ownerIds)
    : { data: [] };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/businesses" className="text-sm text-ink-soft hover:text-accent">
        → כל העסקים
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">{business.name}</h1>
        <Link href={`/admin/offers/new?business=${business.id}`} className="btn-secondary">
          + הטבה לעסק הזה
        </Link>
      </div>
      {error && <Alert tone="error">הפעולה נכשלה. נסי שוב.</Alert>}
      <BusinessForm business={business} />
      <section className="space-y-3 rounded-[var(--radius-card)] bg-surface p-5">
        <h2 className="text-lg text-ink">בעלי העסק (גישה לדשבורד)</h2>
        <p className="text-sm text-ink-soft">
          בעל/ת העסק נרשמים לאתר כמו כל חבר/ה, ואז מחברים אותם כאן לפי המייל. הם יראו רק את העסק הזה.
        </p>
        {owner === "ok" && <Alert tone="success">החיבור נוצר.</Alert>}
        {owner === "removed" && <Alert tone="success">החיבור הוסר.</Alert>}
        {owner === "missing" && <Alert tone="error">לא נמצא משתמש רשום עם המייל הזה.</Alert>}
        {(owners ?? []).length > 0 && (
          <ul className="divide-y divide-line">
            {(owners ?? []).map((o) => (
              <li key={o.id as string} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  {(o.display_name as string | null) ?? ""} <span className="ltr text-ink-soft">{o.email as string}</span>
                </span>
                <form action={unlinkOwner}>
                  <input type="hidden" name="business" value={id} />
                  <input type="hidden" name="user" value={o.id as string} />
                  <button className="text-danger hover:underline">הסרה</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={linkOwner} className="flex flex-wrap gap-2">
          <input type="hidden" name="business" value={id} />
          <input
            type="email"
            name="email"
            required
            placeholder="המייל של בעל/ת העסק (רשום באתר)"
            aria-label="מייל בעל/ת העסק"
            className="ltr min-w-0 flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm"
          />
          <button className="btn-secondary px-5 py-2 text-sm">חיבור</button>
        </form>
      </section>
      <DangerZone
        action={deleteBusiness}
        id={id}
        label="מחיקת העסק"
        warning="המחיקה תמחק גם את כל ההטבות של העסק ואי אפשר לבטל אותה. כדי רק להוריד מהאתר, הסירי את הסימון 'מפורסם באתר'."
      />
    </div>
  );
}
