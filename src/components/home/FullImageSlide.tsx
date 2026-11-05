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
    <Link href={href} aria-label={`${alt}. ${cta}`} className="absolute inset-0 block bg-canvas">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        className="object-cover object-[17%_center] sm:object-[30%_center] md:object-center"
      />
      <span className="btn-primary absolute bottom-14 left-[44%] -translate-x-1/2 whitespace-nowrap !px-5 !py-2 text-sm sm:left-[27%] sm:text-base md:bottom-[14%] md:left-[28%]">
        {cta}
      </span>
    </Link>
  );
}
