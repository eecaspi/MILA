import type { Business } from "@/lib/types";
import { BusinessFront } from "./BusinessFront";
import { BusinessMore, hasMoreToShow } from "./BusinessMore";

/**
 * Outside: picture, name, short description and tags.
 * Inside (hover on desktop, replacing the picture; "עוד על העסק" on phones): three product photos and the website.
 */
export function BusinessCard({ business }: { business: Business }) {
  const more = hasMoreToShow(business);

  return (
    <div className="group/biz relative h-full">
      <article
        tabIndex={0}
        className="lift flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <BusinessFront business={business} />

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

      {/* Larger screens: on hover (or keyboard focus) the picture is replaced, inside the same card, by the
          product photos and the website link. The card keeps its size, so nothing covers other blocks. */}
      {more && (
        <div className="invisible absolute inset-x-0 top-0 z-10 hidden aspect-[16/10] flex-col justify-center overflow-hidden rounded-t-[var(--radius-card)] bg-surface p-4 opacity-0 transition duration-200 group-focus-within/biz:visible group-focus-within/biz:opacity-100 group-hover/biz:visible group-hover/biz:opacity-100 md:flex">
          <BusinessMore business={business} />
        </div>
      )}
    </div>
  );
}
