import Link from "next/link";
import { notFound } from "next/navigation";
import { DangerZone } from "@/components/admin/DangerZone";
import { OfferForm, type OfferFormValues } from "@/components/admin/OfferForm";
import { AdminShare } from "@/components/deals/AdminShare";
import { getOfferById } from "@/lib/data/repository";
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
        "id, business_id, kind, title, value_label, description, valid_until, starts_on, redeem_channel, code_mode, redeem_url, terms, usage_limit, price_label, highlight, unlisted, likey_pick_note, status, is_published, image_url, image_fit, offer_codes(coupon_code)",
      )
      .eq("id", id)
      .maybeSingle(),
    businessOptions(),
  ]);
  if (!offer.data) notFound();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const { data: dailyRows } = await supabase
    .from("offer_daily_codes")
    .select("day, code")
    .eq("offer_id", id)
    .gte("day", today)
    .order("day");
  const dailyUpcoming = (dailyRows ?? []) as { day: string; code: string }[];
  const { offer_codes, ...rest } = offer.data as unknown as Omit<OfferFormValues, "coupon_code"> & {
    offer_codes: { coupon_code: string } | null;
  };
  const publicOffer = Boolean((offer.data as { is_published?: boolean }).is_published) ? await getOfferById(id) : undefined;
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
      {publicOffer ? (
        <div className="rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]">
          <p className="mb-2 font-semibold text-ink">שיתוף בקבוצת הוואטסאפ</p>
          <AdminShare offer={publicOffer} />
        </div>
      ) : (
        <p className="rounded-2xl bg-accent-soft p-3 text-sm font-semibold text-ink">
          כדי לשתף בוואטסאפ, סמני &quot;מפורסם באתר&quot; ו&quot;לקבוצה בלבד&quot; (אם עוד לא רוצות לפרסם לכולן), ושמרי. אז יופיע כאן כפתור שיתוף.
        </p>
      )}
      <OfferForm offer={values} businesses={businesses} dailyUpcoming={dailyUpcoming} />
      <DangerZone
        action={deleteOffer}
        id={id}
        label="מחיקת ההטבה"
        warning="אי אפשר לבטל מחיקה. כדי רק להוריד מהאתר, הסירי את הסימון 'מפורסם באתר'."
      />
    </div>
  );
}
