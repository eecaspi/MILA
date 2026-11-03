import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessForm, type BusinessFormValues } from "@/components/admin/BusinessForm";
import { DangerZone } from "@/components/admin/DangerZone";
import { Alert } from "@/components/ui/Alert";
import { createClient } from "@/lib/supabase/server";
import { deleteBusiness } from "../../content-actions";

export default async function EditBusiness({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, category_slug, short_description, description, area, city, website, phone, tags, status, is_published, sort_order, logo_url, cover_url",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const business = data as BusinessFormValues & { slug: string };

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
      <DangerZone
        action={deleteBusiness}
        id={id}
        label="מחיקת העסק"
        warning="המחיקה תמחק גם את כל ההטבות של העסק ואי אפשר לבטל אותה. כדי רק להוריד מהאתר, הסירי את הסימון 'מפורסם באתר'."
      />
    </div>
  );
}
