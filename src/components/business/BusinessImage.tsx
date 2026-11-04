import Image from "next/image";
import { getCategory } from "@/data/categories";
import type { Business } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";

/**
 * The general picture of a business (its shop, its brand): the cover photo, else
 * its logo, else a colored block with the category icon. Product photos are not
 * used here, they are shown inside the card. Fills its parent (give it a size
 * and `relative`).
 */
export function BusinessImage({ business, sizes }: { business: Business; sizes: string }) {
  if (business.coverUrl) {
    return <Image src={business.coverUrl} alt="" fill sizes={sizes} className="object-cover" />;
  }
  if (business.logoUrl) {
    return (
      <span className="absolute inset-0 bg-raised">
        <Image src={business.logoUrl} alt="" fill sizes={sizes} className="object-contain p-8" />
      </span>
    );
  }
  const category = getCategory(business.category);
  return (
    <span
      aria-hidden
      className={`absolute inset-0 flex items-center justify-center ${toneClasses[category.tone]}`}
    >
      <CategoryIcon slug={category.slug} className="size-14 text-ink/35" />
    </span>
  );
}
