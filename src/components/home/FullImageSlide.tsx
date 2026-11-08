import Image from "next/image";
import Link from "next/link";

/**
 * A hero slide that is one designed picture over the whole banner, with a button on it.
 * The button sits under the logo in the red Liky banner.
 */
export function FullImageSlide({
  image,
  alt,
  href,
  cta,
  priority = false,
}: {
  image: string;
  alt: string;
  href: string;
  cta: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} aria-label={`${alt}. ${cta}`} className="absolute inset-0 flex items-center justify-center bg-canvas sm:block">
      {/* The same picture, blurred, fills the space above and below it on a phone. */}
      <Image
        src={image}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="scale-125 object-cover opacity-80 blur-2xl sm:hidden"
      />
      <span className="relative block aspect-[1600/630] w-full sm:absolute sm:inset-0 sm:aspect-auto">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
          className="object-contain sm:object-cover sm:object-[30%_top] md:object-top"
        />
        <span className="btn-primary absolute bottom-[10%] left-[28%] -translate-x-1/2 whitespace-nowrap !px-3.5 !py-1.5 text-xs sm:bottom-14 sm:left-[27%] sm:!px-7 sm:!py-3 sm:text-base md:bottom-[14%] md:left-[28%]">
          {cta}
        </span>
      </span>
    </Link>
  );
}
