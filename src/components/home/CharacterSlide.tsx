import Image from "next/image";
import Link from "next/link";

/**
 * A hero slide with the Liky character: a message and a button on one side, the picture on
 * the other (above the words on a phone). The pictures have white backgrounds, so the slide is
 * white too.
 */
export function CharacterSlide({
  image,
  alt,
  headline,
  text,
  href,
  cta,
  imageFirst = false,
  priority = false,
}: {
  image: string;
  alt: string;
  headline: string;
  text: string;
  href: string;
  cta: string;
  /** Put the picture on the start side (right) and the words on the other. */
  imageFirst?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative flex size-full items-center gap-2 overflow-hidden bg-surface px-3 py-2 sm:gap-6 sm:px-10 sm:py-4 md:px-20 ${
        imageFirst ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="w-[58%] space-y-1 text-start sm:w-[44%] sm:space-y-4">
        <p className="font-display text-base font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
          {headline}
        </p>
        <p className="line-clamp-2 text-xs text-ink-soft sm:text-lg">{text}</p>
        <Link href={href} className="btn-primary mt-0.5 !px-3 !py-1 text-xs sm:!px-7 sm:!py-3 sm:text-base">
          {cta}
        </Link>
      </div>
      <div className="relative h-full w-[42%] sm:w-[56%]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 640px) 56vw, 100vw"
          priority={priority}
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
