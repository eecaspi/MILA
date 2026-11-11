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
  cta2,
  href2,
  imageFirst = false,
  priority = false,
}: {
  image: string;
  alt: string;
  headline: string;
  text: string;
  href: string;
  cta: string;
  /** An optional second button, shown next to the first. */
  cta2?: string;
  href2?: string;
  /** Put the picture on the start side (right) and the words on the other. */
  imageFirst?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative flex size-full items-stretch gap-1 overflow-hidden bg-surface px-3 pt-0 pb-0 sm:items-center sm:justify-center sm:gap-2 sm:px-10 sm:py-0 md:px-12 ${
        imageFirst ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className={`relative z-10 mb-auto mt-4 max-h-full w-[50%] shrink-0 space-y-1 overflow-y-auto py-2 text-start [scrollbar-width:none] sm:my-0 sm:overflow-visible sm:py-0 sm:w-auto sm:max-w-[40%] md:max-w-[42%] sm:shrink-0 sm:space-y-5 ${imageFirst ? "ml-4" : "mr-4"} sm:m-0`}>
        <p className="font-display text-lg font-bold leading-tight text-ink sm:text-5xl md:text-6xl">
          {headline}
        </p>
        <p className="whitespace-pre-line text-xs leading-snug text-ink-soft sm:text-xl md:text-2xl">{text}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:whitespace-nowrap sm:gap-3">
          <Link href={href} className={`btn-primary cta-pulse !px-4 !py-2 text-sm ${cta2 && href2 ? "sm:!px-6 sm:!py-3 sm:text-lg" : "sm:!px-9 sm:!py-4 sm:text-xl"}`}>
            {cta}
          </Link>
          {cta2 && href2 ? (
            <Link
              href={href2}
              className="btn-secondary cta-pulse border-2 border-accent !px-4 !py-2 text-sm sm:!px-6 sm:!py-3 sm:text-lg"
            >
              {cta2}
            </Link>
          ) : null}
        </div>
      </div>
      <div className={`relative h-full w-[76%] shrink-0 self-end sm:m-0 sm:h-full sm:w-[50%] md:w-[54%] sm:self-end ${imageFirst ? "-me-[16%]" : "-ms-[16%]"}`}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 640px) 56vw, 100vw"
          priority={priority}
          className={`object-contain object-bottom ${imageFirst ? "sm:object-left-bottom" : "sm:object-right-bottom"}`}
        />
      </div>
    </div>
  );
}
