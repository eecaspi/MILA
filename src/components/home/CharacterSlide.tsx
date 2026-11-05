import Image from "next/image";
import Link from "next/link";

/**
 * A hero slide with the Liky character: words on one side, the character on the other.
 * The pictures have white backgrounds, so they are multiplied onto the blush background.
 */
export function CharacterSlide({
  image,
  alt,
  headline,
  text,
  href,
  cta,
  priority = false,
}: {
  image: string;
  alt: string;
  headline: string;
  text: string;
  href: string;
  cta: string;
  priority?: boolean;
}) {
  return (
    <div className="relative flex size-full items-center justify-between gap-2 overflow-hidden bg-[radial-gradient(70%_100%_at_30%_0%,#fff3f3_0%,var(--color-canvas)_75%)] px-5 pb-12 pt-4 sm:px-10 md:px-20">
      <div className="max-w-[58%] space-y-2 sm:max-w-[50%] sm:space-y-4">
        <p className="font-display text-2xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
          {headline}
        </p>
        <p className="text-sm text-ink-soft sm:text-lg">{text}</p>
        <Link href={href} className="btn-primary mt-1 text-sm sm:text-base">
          {cta}
        </Link>
      </div>
      <div className="relative h-full w-[38%] max-w-[380px] shrink-0 sm:w-[34%]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 340px, 40vw"
          priority={priority}
          className="object-contain object-bottom mix-blend-multiply"
        />
      </div>
    </div>
  );
}
