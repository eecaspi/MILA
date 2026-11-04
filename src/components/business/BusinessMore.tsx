import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/data/categories";
import { hostname } from "@/lib/format";
import type { Business, Offer } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BusinessImage } from "./BusinessImage";

export type BusinessOffer = Pick<Offer, "id" | "title" | "valueLabel">;

/**
 * Everything about a business except its picture and name (which are on the
 * front of the card): category and area, description, tags, a few photos,
 * current offers and contact buttons. Shown on hover (desktop) or tap (phones).
 * With `withHeader` it also repeats the picture and name, for the hover panel
 * that sits on top of the card.
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
  // The first photo is already the card's picture when there is no cover image.
  const gallery = (business.galleryUrls ?? []).slice(business.coverUrl ? 0 : 1);
  const text = business.description || business.shortDescription;

  return (
    <div className="space-y-4">
      {withHeader && (
        <div className="-mx-5 -mt-5 mb-1">
          <div className="relative h-36 overflow-hidden rounded-t-[var(--radius-card)]">
            <BusinessImage business={business} sizes="400px" />
          </div>
          <p className="px-5 pt-4 text-xl leading-tight font-bold text-ink">{business.name}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {category.name}
          {business.area && ` · ${business.area}`}
        </p>
        <StatusBadge status={business.status} />
      </div>

      {text && <p className="text-[15px] leading-relaxed text-ink-soft">{text}</p>}

      {business.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="תגיות">
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

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm">
        {business.website ? (
          <a
            href={business.website}
            data-track-business={business.id}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-primary px-4 py-2 text-sm shadow-none"
          >
            לאתר העסק <span className="ltr text-xs opacity-80">{hostname(business.website)}</span>
          </a>
        ) : (
          <span className="text-ink-soft">אתר: טרם אומת</span>
        )}
        {business.phone && (
          <a
            href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`}
            className="btn-secondary px-4 py-2 text-sm"
          >
            <span className="ltr">{business.phone}</span>
          </a>
        )}
        {business.isRealBusiness && business.status === "demo" && (
          <span className="text-xs text-ink-soft">ללא קשר מסחרי</span>
        )}
      </div>
    </div>
  );
}
