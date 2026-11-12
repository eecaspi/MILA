import Image from "next/image";
import Link from "next/link";
import { Emphasis } from "./Emphasis";

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
      <div className={`relative z-10 flex h-full max-h-full w-[70%] shrink-0 flex-col space-y-2 overflow-y-auto px-3 pb-3 pt-4 text-start [scrollbar-width:none] sm:my-0 sm:block sm:h-auto sm:overflow-visible sm:p-0 sm:w-auto sm:max-w-[40%] md:max-w-[42%] sm:shrink-0 sm:space-y-5 ${imageFirst ? "ml-3 md:ml-16" : "mr-3 md:mr-16"} sm:m-0`}>
        <p className="font-display text-2xl font-bold leading-tight text-ink sm:text-5xl md:text-6xl">
          {headline}
        </p>
        <p className="whitespace-pre-line text-[13px] leading-snug text-ink-soft sm:text-xl md:text-2xl">
          <Emphasis text={text} />
        </p>
        <div className="hidden items-center sm:mt-2 sm:flex sm:flex-nowrap sm:whitespace-nowrap sm:gap-3">
          <Link href={href} className={`btn-primary cta-pulse !px-4 !py-2.5 text-base ${cta2 && href2 ? "sm:!px-6 sm:!py-3 sm:text-lg" : "sm:!px-9 sm:!py-4 sm:text-xl"}`}>
            {cta}
          </Link>
          {cta2 && href2 ? (
            <Link
              href={href2}
              className="btn-secondary cta-pulse border-2 border-accent !px-4 !py-2.5 text-base sm:!px-6 sm:!py-3 sm:text-lg"
            >
              {cta2}
            </Link>
          ) : null}
        </div>
      </div>
      <div className={`absolute bottom-3 z-20 flex flex-nowrap items-center gap-2 whitespace-nowrap sm:hidden ${imageFirst ? "left-3" : "right-3"}`}>
        <Link href={href} className="btn-primary cta-pulse !bg-white !px-3 !py-2 text-xs">
          {cta}
        </Link>
        {cta2 && href2 ? (
          <Link href={href2} className="btn-secondary cta-pulse border-2 border-accent !bg-white !px-3 !py-2 text-xs">
            {cta2}
          </Link>
        ) : null}
      </div>
      <div className={`relative h-full w-[56%] shrink-0 self-end sm:m-0 sm:h-full sm:w-[50%] md:w-[54%] sm:self-end ${imageFirst ? "-me-[28%]" : "-ms-[28%]"}`}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 640px) 56vw, 100vw"
          priority={priority}
          className={`object-contain object-bottom max-sm:scale-[1.4] ${imageFirst ? "max-sm:origin-bottom-right" : "max-sm:origin-bottom-left"} ${imageFirst ? "sm:object-left-bottom" : "sm:object-right-bottom"}`}
        />
      </div>
    </div>
  );
}
