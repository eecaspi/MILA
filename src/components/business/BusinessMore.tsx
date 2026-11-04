import Image from "next/image";
import { hostname } from "@/lib/format";
import type { Business } from "@/lib/types";

/** True when a business has anything to show inside the card (a website or photos). */
export function hasMoreToShow(business: Business): boolean {
  return Boolean(business.website || business.galleryUrls?.length);
}

/**
 * Inside the card, shown on hover (desktop) or tap (phones): three photos of the
 * business's products and the link to its website.
 */
export function BusinessMore({ business }: { business: Business }) {
  const photos = (business.galleryUrls ?? []).slice(0, 3);

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2" aria-label={`תמונות מ${business.name}`}>
          {photos.map((url) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-xl bg-raised">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            </li>
          ))}
        </ul>
      )}

      {business.website && (
        <a
          href={business.website}
          data-track-business={business.id}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn-primary w-full px-4 py-2.5 text-sm shadow-none"
        >
          לאתר העסק <span className="ltr text-xs opacity-80">{hostname(business.website)}</span>
        </a>
      )}
    </div>
  );
}
