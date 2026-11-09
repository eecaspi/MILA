import Image from "next/image";
import { getCategory } from "@/data/categories";
import type { Business } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";

/**
 * The general picture of a business (its shop, its brand): the cover photo, else
 * its logo (both fill the frame), else a colored block with the category icon. Product photos are not
 * used here, they are shown inside the card. Fills its parent (give it a size
 * and `relative`).
 */
export function BusinessImage({ business, sizes }: { business: Business; sizes: string }) {
  // Cover photo, or the logo when there is no cover: either one fills the whole frame.
  const picture = business.coverUrl ?? business.logoUrl;
  if (picture) {
    return (
      <>
        {business.imageFit === "contain" && (
          <Image src={picture} alt="" aria-hidden fill sizes="25vw" className="scale-150 object-cover blur-3xl" />
        )}
        <Image
          src={picture}
          alt=""
          fill
          sizes={sizes}
          className={
            business.imageFit === "contain"
              ? "object-contain"
              : business.imageFit === "top"
                ? "object-cover object-top"
                : business.imageFit === "bottom"
                  ? "object-cover object-bottom"
                  : "object-cover"
          }
        />
      </>
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
