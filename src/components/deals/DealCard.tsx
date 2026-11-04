import Link from "next/link";
import { TagMark } from "@/components/brand/TagMark";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";
import type { OfferWithBusiness } from "@/lib/types";
import { OfferImage } from "./OfferImage";

const kindLabel = { deal: "מבצע", coupon: "קופון" } as const;

/**
 * Offer card: image, benefit, business, title, price (only when real), CTA.
 * `layout="row"` is the compact horizontal version used for "מה חדש".
 */
export function DealCard({
  offer,
  layout = "card",
  showPickNote = false,
}: {
  offer: OfferWithBusiness;
  layout?: "card" | "row";
  showPickNote?: boolean;
}) {
  const href = `/deals/${offer.id}`;
  const isDemo = offer.status === "demo";

  if (layout === "row") {
    return (
      <article className="lift relative flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-3 shadow-[var(--shadow-card)]">
        <OfferImage
          offer={offer}
          className="aspect-square w-24 shrink-0 rounded-2xl"
          sizes="96px"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink-soft">{offer.business.name}</p>
          <h3 className="truncate text-base text-ink">
            <Link href={href} className="after:absolute after:inset-0">
              {offer.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-bold text-accent">
            {offer.locked && <span aria-hidden>🔒 </span>}
            {offer.valueLabel}
          </p>
        </div>
        {isDemo && (
          <span className="shrink-0 self-start rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
            לדוגמה
          </span>
        )}
      </article>
    );
  }

  return (
    <article className="lift relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
      <div className="relative">
        <OfferImage offer={offer} className="aspect-[16/9] sm:aspect-[4/3]" />
        <span className="absolute start-3 top-3 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-on-accent shadow-[var(--shadow-soft)]">
          {offer.locked && <span aria-hidden>🔒 </span>}
          {offer.valueLabel}
        </span>
        <span className="absolute end-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {kindLabel[offer.kind]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-ink-soft">{offer.business.name}</p>
        <h3 className="mt-1 text-xl text-ink">{offer.title}</h3>
        {offer.priceLabel && <p className="mt-1 font-bold text-ink">{offer.priceLabel}</p>}

        {showPickNote && offer.likeyPick && (
          <p className="mt-3 flex gap-2 rounded-2xl bg-accent-soft/60 p-3 text-sm text-ink">
            <TagMark size={20} className="mt-0.5 shrink-0" />
            <span>{offer.likeyPick.note}</span>
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            {isDemo && <StatusBadge status={offer.status} />}
            {offer.validUntil && <span>בתוקף עד {formatDate(offer.validUntil)}</span>}
          </div>
          <Link
            href={href}
            className="btn-secondary w-full py-2.5 text-[15px] after:absolute after:inset-0"
          >
            בואי לראות מה שווה
          </Link>
        </div>
      </div>
    </article>
  );
}
