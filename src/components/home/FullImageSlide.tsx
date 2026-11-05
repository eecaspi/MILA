import Image from "next/image";
import Link from "next/link";

/**
 * A hero slide that is one picture over the whole banner.
 * "cover" fills the banner (for designed banners); "contain" keeps a whole figure in view and
 * blends its white background into the page colour.
 */
export function FullImageSlide({
  image,
  alt,
  href,
  fit,
  priority = false,
}: {
  image: string;
  alt: string;
  href: string;
  fit: "cover" | "contain";
  priority?: boolean;
}) {
  return (
    <Link href={href} aria-label={alt} className="absolute inset-0 block bg-canvas">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        className={
          fit === "cover"
            ? "object-cover object-[30%_center] md:object-center"
            : "object-contain object-center mix-blend-multiply"
        }
      />
    </Link>
  );
}
