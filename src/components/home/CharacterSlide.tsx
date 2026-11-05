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
      className={`relative flex size-full flex-col items-center gap-1 overflow-hidden bg-surface px-5 pb-12 pt-3 sm:gap-6 sm:px-10 sm:py-4 md:px-20 ${
        imageFirst ? "sm:flex-row-reverse" : "sm:flex-row"
      }`}
    >
      <div className="space-y-1.5 text-center sm:w-[44%] sm:space-y-4 sm:text-start">
        <p className="font-display text-xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
          {headline}
        </p>
        <p className="text-sm text-ink-soft sm:text-lg">{text}</p>
        <Link href={href} className="btn-primary mt-1 !px-5 !py-2 text-sm sm:!px-7 sm:!py-3 sm:text-base">
          {cta}
        </Link>
      </div>
      <div className="relative order-first min-h-0 w-full flex-1 sm:order-none sm:h-full sm:w-[56%] sm:flex-none">
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
