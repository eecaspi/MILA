import Image from "next/image";
import { getCategory } from "@/data/categories";
import type { Business } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";
import { BusinessMore, type BusinessOffer } from "./BusinessMore";

export function BusinessCard({
  business,
  offers = [],
}: {
  business: Business;
  offers?: BusinessOffer[];
}) {
  const category = getCategory(business.category);
  const hasMore = Boolean(
    business.description ||
    business.coverUrl ||
    business.galleryUrls?.length ||
    offers.length ||
    business.phone ||
    business.website,
  );

  return (
    <div className="group/biz relative h-full">
      <article className="lift flex h-full flex-col rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-raised">
                <Image src={business.logoUrl} alt="" fill sizes="48px" className="object-cover" />
              </span>
            ) : (
              <span
                aria-hidden
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[category.tone]}`}
              >
                <CategoryIcon slug={category.slug} className="size-6 text-ink/75" />
              </span>
            )}
            <div>
              <h3 className="text-lg leading-tight text-ink">{business.name}</h3>
              <p className="text-sm text-ink-soft">
                {category.name} · {business.area}
              </p>
            </div>
          </div>
          <StatusBadge status={business.status} />
        </div>

        <p className="mt-4 flex-1 text-[15px] text-ink-soft">{business.shortDescription}</p>

        {business.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="תגיות">
            {business.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-ink-soft"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 hidden items-center justify-between border-t border-line pt-4 text-sm md:flex">
          {/* The website link lives in the details that open on hover. */}
          <span className="font-semibold text-accent">פרטים וקישור לאתר ←</span>
          {business.isRealBusiness && business.status === "demo" && (
            <span className="text-xs text-ink-soft">ללא קשר מסחרי</span>
          )}
        </div>

        {/* Phones: tap to open more details inside the card. */}
        {hasMore && (
          <details className="group/more mt-4 md:hidden">
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
        )}
      </article>

      {/* Larger screens: hover (or keyboard focus) opens a richer card on top. */}
      <div className="invisible absolute inset-x-0 top-0 z-30 hidden -translate-y-1 rounded-[var(--radius-card)] bg-surface p-5 opacity-0 shadow-[var(--shadow-soft)] ring-1 ring-line transition duration-200 group-focus-within/biz:visible group-focus-within/biz:translate-y-0 group-focus-within/biz:opacity-100 group-hover/biz:visible group-hover/biz:translate-y-0 group-hover/biz:opacity-100 group-hover/biz:delay-150 md:block">
        <BusinessMore business={business} offers={offers} withHeader />
      </div>
    </div>
  );
}
