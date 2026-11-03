import { getCategory } from "@/data/categories";
import { hostname } from "@/lib/format";
import type { Business } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";

export function BusinessCard({ business }: { business: Business }) {
  const category = getCategory(business.category);

  return (
    <article className="lift flex h-full flex-col rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[category.tone]}`}
          >
            <CategoryIcon slug={category.slug} className="size-6 text-ink/75" />
          </span>
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

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
        {business.website ? (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-bold text-accent hover:underline"
          >
            לאתר העסק <span className="ltr text-ink-soft">({hostname(business.website)})</span>
          </a>
        ) : (
          <span className="text-ink-soft">אתר: טרם אומת</span>
        )}
        {business.isRealBusiness && business.status === "demo" && (
          <span className="text-xs text-ink-soft">ללא קשר מסחרי</span>
        )}
      </div>
    </article>
  );
}
