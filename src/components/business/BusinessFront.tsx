import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Business } from "@/lib/types";
import { BusinessImage } from "./BusinessImage";

export interface CardOffer {
  id: string;
  title: string;
  valueLabel: string;
}

/** What a visitor sees first: picture, name, a short description and tags. */
export function BusinessFront({ business, offers = [] }: { business: Business; offers?: CardOffer[] }) {
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
        {offers.length > 0 && (
          <ul className="mt-3 space-y-1.5 sm:mt-4" aria-label="הטבות">
            {offers.slice(0, 2).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/deals/${o.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-accent/25 bg-surface px-3 py-2.5 transition hover:border-accent hover:bg-accent-soft"
                >
                  {o.valueLabel && (
                    <span className="max-w-[40%] shrink-0 rounded-lg bg-accent px-2.5 py-1 text-center text-sm font-extrabold leading-tight text-on-accent">
                      {o.valueLabel}
                    </span>
                  )}
                  <span className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-ink">{o.title}</span>
                  <span aria-hidden className="shrink-0 text-accent transition group-hover:-translate-x-0.5">←</span>
                </Link>
              </li>
            ))}
            {offers.length > 2 && (
              <li className="px-1 text-xs text-ink-soft">ועוד {offers.length - 2} הטבות</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
