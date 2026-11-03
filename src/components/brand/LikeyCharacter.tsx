import Image from "next/image";
import { siteConfig } from "@/config/site";
import { HeartMark } from "./HeartMark";

/**
 * Reserved slot for the לייקי AI character.
 *
 * The layout always gives her the same frame (4:5 portrait, rounded, blush
 * background), so when the final character art or video arrives it drops in
 * via `src` without any page re-layout. Until then a branded placeholder is
 * shown — never a stock photo, and never a generated stand-in.
 */
export function LikeyCharacter({
  src,
  message = siteConfig.brand.slogan,
  className = "",
}: {
  /** Final character image (e.g. /likey/hero.webp). Omit to show the placeholder. */
  src?: string;
  /** What לייקי "says" in the speech bubble. */
  message?: string;
  className?: string;
}) {
  return (
    <figure
      data-character-slot="likey"
      className={`relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-[radial-gradient(80%_70%_at_70%_20%,#fffdf9_0%,#ece2f3_55%,#dccbea_100%)] shadow-[var(--shadow-soft)] ${className}`}
    >
      {src && siteConfig.features.aiCharacter ? (
        <Image
          src={src}
          alt="לייקי"
          fill
          sizes="(min-width: 768px) 24rem, 80vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="float-soft">
            <HeartMark size={120} color="var(--color-accent)" />
          </div>
          <p className="font-display text-lg font-bold text-accent">לייקי בדרך אלייך</p>
          <p className="max-w-[14rem] text-sm text-ink-soft">
            בקרוב תכירי אותה – החברה שתמיד יודעת איפה יש משהו שווה.
          </p>
        </div>
      )}

      {/* Speech bubble: always there, so the slot reads as "לייקי talking". */}
      <figcaption className="absolute start-4 top-4 max-w-[75%] rounded-2xl rounded-ss-sm bg-surface px-4 py-2.5 font-display text-base font-bold text-ink shadow-[var(--shadow-card)]">
        {message}
      </figcaption>
    </figure>
  );
}
