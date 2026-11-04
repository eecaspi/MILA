import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Business } from "@/lib/types";
import { BusinessImage } from "./BusinessImage";
import { BusinessMore, type BusinessOffer } from "./BusinessMore";

/**
 * Front of the card: just the business's picture and name. Everything else
 * opens on hover (desktop) or with the "עוד על העסק" button (phones).
 */
export function BusinessCard({
  business,
  offers = [],
}: {
  business: Business;
  offers?: BusinessOffer[];
}) {
  return (
    <div className="group/biz relative h-full">
      <article
        tabIndex={0}
        className="lift flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <BusinessImage
            business={business}
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 92vw"
          />
          {/* Demo / verified labelling stays visible on the picture. */}
          <span className="absolute start-3 top-3">
            <StatusBadge status={business.status} />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-xl leading-tight text-ink">{business.name}</h3>

          {/* Phones: tap to open the details inside the card. */}
          <details className="group/more mt-3 md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-full bg-raised py-2 text-sm font-semibold text-accent [&::-webkit-details-marker]:hidden">
              <span className="group-open/more:hidden">עוד על העסק</span>
              <span className="hidden group-open/more:inline">פחות</span>
              <span aria-hidden className="transition-transform group-open/more:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="pt-4">
              <BusinessMore business={business} offers={offers} />
            </div>
          </details>
        </div>
      </article>

      {/* Larger screens: hover (or keyboard focus) opens the details on top of the card. */}
      <div className="invisible absolute inset-x-0 top-0 z-30 hidden -translate-y-1 rounded-[var(--radius-card)] bg-surface p-5 opacity-0 shadow-[var(--shadow-soft)] ring-1 ring-line transition duration-200 group-focus-within/biz:visible group-focus-within/biz:translate-y-0 group-focus-within/biz:opacity-100 group-hover/biz:visible group-hover/biz:translate-y-0 group-hover/biz:opacity-100 group-hover/biz:delay-150 md:block">
        <BusinessMore business={business} offers={offers} withHeader />
      </div>
    </div>
  );
}
