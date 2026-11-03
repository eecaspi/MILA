import { getCategory } from "@/data/categories";
import { formatDate } from "@/lib/format";
import type { OfferWithBusiness } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyCouponButton } from "./CopyCouponButton";

const kindLabel = { deal: "מבצע", coupon: "קופון" } as const;

export function DealCard({ offer }: { offer: OfferWithBusiness }) {
  const category = getCategory(offer.business.category);
  const isDemo = offer.status === "demo";

  return (
    <article
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-surface transition-colors hover:border-gold/60",
        isDemo ? "border-dashed border-gold/40" : "border-line",
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-line bg-[radial-gradient(120%_120%_at_100%_0%,rgba(201,164,92,0.16),transparent_60%)] px-5 py-5">
        <p className="font-display text-3xl font-medium text-gold">{offer.valueLabel}</p>
        <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold text-gold">
          {kindLabel[offer.kind]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={offer.status} />
          <span className="text-xs text-ink-soft">{category.name}</span>
        </div>

        <h3 className="text-lg font-medium text-ink">{offer.title}</h3>
        <p className="text-sm font-medium text-gold">{offer.business.name}</p>
        <p className="mt-2 flex-1 text-sm text-ink-soft">{offer.description}</p>

        {offer.couponCode && (
          <div className="mt-4">
            <CopyCouponButton code={offer.couponCode} />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
          {offer.validUntil ? <span>בתוקף עד {formatDate(offer.validUntil)}</span> : <span />}
          {isDemo && <span className="font-semibold text-gold">לדוגמה בלבד — לא למימוש</span>}
        </div>
      </div>
    </article>
  );
}
