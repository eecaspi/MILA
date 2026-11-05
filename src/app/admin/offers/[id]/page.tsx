import Link from "next/link";
import { notFound } from "next/navigation";
import { DangerZone } from "@/components/admin/DangerZone";
import { OfferForm, type OfferFormValues } from "@/components/admin/OfferForm";
import { createClient } from "@/lib/supabase/server";
import { deleteOffer } from "../../content-actions";
import { businessOptions } from "../business-options";

export default async function EditOffer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [offer, businesses] = await Promise.all([
    supabase
      .from("offers")
      .select(
        "id, business_id, kind, title, value_label, description, valid_until, starts_on, redeem_channel, price_label, highlight, likey_pick_note, status, is_published, image_url, offer_codes(coupon_code)",
      )
      .eq("id", id)
      .maybeSingle(),
    businessOptions(),
  ]);
  if (!offer.data) notFound();
  const { offer_codes, ...rest } = offer.data as unknown as Omit<OfferFormValues, "coupon_code"> & {
    offer_codes: { coupon_code: string } | null;
  };
  const values: OfferFormValues = { ...rest, coupon_code: offer_codes?.coupon_code ?? null };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/offers" className="text-sm text-ink-soft hover:text-accent">
        → כל ההטבות
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">{values.title}</h1>
        {values.is_published && (
          <Link
            href={`/deals/${values.id}`}
            target="_blank"
            className="text-sm font-semibold text-accent hover:underline"
          >
            צפייה באתר ↗
          </Link>
        )}
      </div>
      <OfferForm offer={values} businesses={businesses} />
      <DangerZone
        action={deleteOffer}
        id={id}
        label="מחיקת ההטבה"
        warning="אי אפשר לבטל מחיקה. כדי רק להוריד מהאתר, הסירי את הסימון 'מפורסם באתר'."
      />
    </div>
  );
}
