import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/data/categories";
import { hostname } from "@/lib/format";
import type { Business, Offer } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";

export type BusinessOffer = Pick<Offer, "id" | "title" | "valueLabel">;

/**
 * "More about this business": photo, longer description, a few photos of its
 * products and its current offers. Shown on hover (desktop) or tap (mobile).
 */
export function BusinessMore({
  business,
  offers = [],
  withHeader = false,
}: {
  business: Business;
  offers?: BusinessOffer[];
  withHeader?: boolean;
}) {
  const category = getCategory(business.category);
  const gallery = business.galleryUrls ?? [];
  const text = business.description || business.shortDescription;

  return (
    <div className="space-y-4">
      {withHeader && (
        <div className="-mx-5 -mt-5 overflow-hidden rounded-t-[var(--radius-card)]">
          {business.coverUrl ? (
            <div className="relative h-32">
              <Image src={business.coverUrl} alt="" fill sizes="400px" className="object-cover" />
            </div>
          ) : (
            <div
              aria-hidden
              className={`flex h-20 items-center justify-center ${toneClasses[category.tone]}`}
            >
              <CategoryIcon slug={category.slug} className="size-9 text-ink/40" />
            </div>
          )}
          <div className="flex items-center gap-3 px-5 pt-4">
            {business.logoUrl && (
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-raised">
                <Image src={business.logoUrl} alt="" fill sizes="40px" className="object-cover" />
              </span>
            )}
            <div>
              <p className="text-lg leading-tight font-bold text-ink">{business.name}</p>
              <p className="text-sm text-ink-soft">
                {category.name}
                {business.area && ` · ${business.area}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {text && <p className="text-[15px] leading-relaxed text-ink-soft">{text}</p>}

      {gallery.length > 0 && (
        <ul className="grid grid-cols-4 gap-2" aria-label={`תמונות מ${business.name}`}>
          {gallery.slice(0, 4).map((url, i) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-xl bg-raised">
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              {i === 3 && gallery.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-sm font-bold text-white">
                  +{gallery.length - 4}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {offers.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-ink">לייקי מצאה כאן</p>
          <ul className="space-y-1.5">
            {offers.slice(0, 3).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/deals/${o.id}`}
                  className="flex items-center gap-2 rounded-xl bg-raised px-3 py-2 text-sm hover:bg-accent-soft"
                >
                  <span className="shrink-0 rounded-lg bg-accent px-2 py-0.5 text-xs font-bold text-on-accent">
                    {o.valueLabel}
                  </span>
                  <span className="min-w-0 truncate text-ink">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(business.website || business.phone) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {business.website && (
            <a
              href={business.website}
              data-track-business={business.id}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-primary px-4 py-2 text-sm shadow-none"
            >
              לאתר העסק <span className="ltr text-xs opacity-80">{hostname(business.website)}</span>
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`}
              className="btn-secondary px-4 py-2 text-sm"
            >
              <span className="ltr">{business.phone}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
