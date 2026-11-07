import type { Business } from "@/lib/types";
import { BusinessFront } from "./BusinessFront";
import { BusinessMore, hasMoreToShow } from "./BusinessMore";

/**
 * Outside: picture, name, short description and tags.
 * Inside (always shown on larger screens, "עוד על העסק" on phones): three product photos and the website.
 */
export function BusinessCard({ business }: { business: Business }) {
  const more = hasMoreToShow(business);

  return (
    <div className="relative h-full">
      <article
        tabIndex={0}
        className="lift flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <BusinessFront business={business} />

        {/* Larger screens: the photos and the website sit in the card itself, nothing floats over other blocks. */}
        {more && (
          <div className="hidden px-5 pb-5 md:block">
            <BusinessMore business={business} />
          </div>
        )}

        {/* Phones: tap to open the inside of the card. */}
        {more && (
          <details className="group/more px-5 pb-5 md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-full bg-raised py-2 text-sm font-semibold text-accent [&::-webkit-details-marker]:hidden">
              <span className="group-open/more:hidden">עוד על העסק</span>
              <span className="hidden group-open/more:inline">פחות</span>
              <span aria-hidden className="transition-transform group-open/more:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="pt-4">
              <BusinessMore business={business} />
            </div>
          </details>
        )}
      </article>

    </div>
  );
}
