import Image from "next/image";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { toneClasses } from "@/components/ui/tones";
import { getCategory } from "@/data/categories";
import type { OfferWithBusiness } from "@/lib/types";

/**
 * The offer's image. Uses the business-supplied image when there is one;
 * otherwise a calm category illustration (never a stock photo pretending to be the product).
 */
export function OfferImage({
  offer,
  className = "aspect-[4/3]",
  sizes = "(min-width: 768px) 33vw, 100vw",
}: {
  offer: OfferWithBusiness;
  className?: string;
  sizes?: string;
}) {
  const category = getCategory(offer.business.category);

  if (offer.imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {offer.imageFit === "contain" && (
          <Image src={offer.imageUrl} alt="" aria-hidden fill sizes="25vw" className="scale-150 object-cover blur-3xl" />
        )}
        <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          sizes={sizes}
          className={
            offer.imageFit === "contain"
              ? "object-contain"
              : offer.imageFit === "top"
                ? "object-cover object-top"
                : offer.imageFit === "bottom"
                  ? "object-cover object-bottom"
                  : "object-cover"
          }
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center overflow-hidden ${toneClasses[category.tone]} ${className}`}
    >
      <div className="absolute -end-6 -top-6 size-28 rounded-full bg-white/50" />
      <div className="absolute -start-8 -bottom-10 size-32 rounded-full bg-white/35" />
      <CategoryIcon slug={category.slug} className="relative size-14 text-ink/70" />
    </div>
  );
}
