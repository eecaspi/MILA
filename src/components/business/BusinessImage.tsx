import Image from "next/image";
import { getCategory } from "@/data/categories";
import type { Business } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";

/**
 * The picture that represents a business: its cover photo, else its first
 * product photo, else its logo, else a colored block with the category icon.
 * Fills its parent (give the parent a size and `relative`).
 */
export function BusinessImage({ business, sizes }: { business: Business; sizes: string }) {
  const photo = business.coverUrl ?? business.galleryUrls?.[0];
  if (photo) {
    return <Image src={photo} alt="" fill sizes={sizes} className="object-cover" />;
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
