import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Business } from "@/lib/types";
import { BusinessImage } from "./BusinessImage";

/** What a visitor sees first: picture, name, a short description and tags. */
export function BusinessFront({ business }: { business: Business }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative aspect-[4/3] shrink-0 md:aspect-[16/10] overflow-hidden">
        <BusinessImage
          business={business}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 92vw"
        />
        {/* Demo / verified labelling stays visible on the picture. */}
        <span className="absolute start-3 top-3">
          <StatusBadge status={business.status} />
        </span>
      </div>

      <div className="flex-1 p-3 sm:p-5">
        <h3 className="text-lg leading-tight text-ink sm:text-xl">{business.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft sm:mt-2 sm:line-clamp-none sm:text-[15px]">{business.shortDescription}</p>
        {business.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4" aria-label="תגיות">
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
      </div>
    </div>
  );
}
