import Link from "next/link";
import { OfferForm } from "@/components/admin/OfferForm";
import { businessOptions } from "../business-options";

export default async function NewOffer({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const [{ business }, businesses] = await Promise.all([searchParams, businessOptions()]);
  const preset = businesses.some((b) => b.id === business) ? business : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/offers" className="text-sm text-ink-soft hover:text-accent">
        → כל ההטבות
      </Link>
      <h1 className="text-2xl text-ink">הטבה חדשה</h1>
      {businesses.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-6 text-ink-soft">
          קודם צריך להוסיף עסק.{" "}
          <Link href="/admin/businesses/new" className="font-semibold text-accent">
            להוספת עסק
          </Link>
        </p>
      ) : (
        <OfferForm
          businesses={businesses}
          offer={
            preset
              ? {
                  business_id: preset,
                  kind: "deal",
                  title: "",
                  value_label: "",
                  description: "",
                  valid_until: null,
                  starts_on: null,
                  redeem_channel: null,
                  price_label: null,
                  highlight: false,
                  likey_pick_note: null,
                  status: "listed",
                  is_published: false,
                  image_url: null,
                  coupon_code: null,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
