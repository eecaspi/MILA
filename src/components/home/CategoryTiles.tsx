import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { categories } from "@/data/categories";

/**
 * Big inviting category tiles in a swipeable row. A category with a photo shows it with the name
 * over it; until then a soft designed tile with a large icon is shown.
 */
export function CategoryTiles() {
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => (
        <li key={c.slug} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
          <Link
            href={`/businesses?category=${c.slug}`}
            className="lift group relative flex aspect-[4/3] items-end overflow-hidden rounded-3xl bg-accent-soft"
          >
            {c.image ? (
              <>
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 44vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </>
            ) : (
              <>
                <span aria-hidden className="absolute -start-6 -top-6 size-28 rounded-full bg-surface/70" />
                <span aria-hidden className="absolute -bottom-8 -end-6 size-32 rounded-full bg-surface/60" />
                <span className="absolute inset-0 flex items-center justify-center pb-6 text-accent/70">
                  <CategoryIcon slug={c.slug} className="size-14" />
                </span>
              </>
            )}
            <span
              className={`relative w-full p-3 font-display text-lg font-bold leading-tight ${
                c.image ? "text-white" : "text-ink"
              }`}
            >
              {c.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
