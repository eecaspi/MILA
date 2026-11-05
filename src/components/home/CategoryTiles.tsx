import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { categories } from "@/data/categories";

/**
 * Category banners: a picture with the name and icon already in it, two per row. A category without
 * a picture falls back to a soft designed tile.
 */
export function CategoryTiles() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {categories.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/businesses?category=${c.slug}`}
            className="lift block overflow-hidden rounded-3xl bg-accent-soft"
          >
            {c.image ? (
              <Image
                src={c.image}
                alt={c.name}
                width={1200}
                height={240}
                sizes="(min-width: 1152px) 560px, (min-width: 640px) 48vw, 94vw"
                className="h-auto w-full"
              />
            ) : (
              <span className="flex items-center justify-end gap-3 p-6 font-display text-xl font-bold text-ink">
                <CategoryIcon slug={c.slug} className="size-8 text-accent" />
                {c.name}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
