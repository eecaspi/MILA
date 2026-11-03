import { getCategory } from "@/data/categories";
import { formatDate } from "@/lib/format";
import type { OfferWithBusiness } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toneClasses } from "@/components/ui/tones";
import { CopyCouponButton } from "./CopyCouponButton";

const kindLabel = { deal: "מבצע", coupon: "קופון" } as const;

export function DealCard({ offer }: { offer: OfferWithBusiness }) {
  const category = getCategory(offer.business.category);
  const isDemo = offer.status === "demo";

  return (
    <article
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface transition-transform hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div
        className={`flex items-center justify-between gap-3 px-5 py-5 ${toneClasses[category.tone].solid}`}
      >
        <p className="text-3xl leading-tight font-extrabold">{offer.valueLabel}</p>
        <span className="shrink-0 rounded-full bg-black/10 px-3 py-1 text-xs font-bold">
          {kindLabel[offer.kind]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={offer.status} />
          <span className="text-xs text-ink-soft">{category.name}</span>
        </div>

        <h3 className="text-xl font-extrabold text-ink">{offer.title}</h3>
        <p className={`text-sm font-bold ${toneClasses[category.tone].text}`}>
          {offer.business.name}
        </p>
        <p className="mt-2 flex-1 text-[15px] text-ink-soft">{offer.description}</p>

        {offer.couponCode && (
          <div className="mt-4">
            <CopyCouponButton code={offer.couponCode} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          {offer.validUntil ? <span>בתוקף עד {formatDate(offer.validUntil)}</span> : <span />}
          {isDemo && <span className="font-semibold text-accent">לדוגמה בלבד — לא למימוש</span>}
        </div>
      </div>
    </article>
  );
}
