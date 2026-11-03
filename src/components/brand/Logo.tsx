import { siteConfig } from "@/config/site";
import { HeartMark } from "./HeartMark";

export type LogoVariant = "primary" | "slogan" | "compact" | "icon";

const sizes = {
  primary: { heart: 34, word: "text-[2.1rem]" },
  slogan: { heart: 52, word: "text-[3.25rem] md:text-[4rem]" },
  compact: { heart: 24, word: "text-[1.6rem]" },
  icon: { heart: 40, word: "" },
} as const;

/**
 * לייקי logo.
 * - primary: heart + wordmark
 * - slogan: heart + wordmark + "יש לי משהו בשבילך!"
 * - compact: smaller lockup for the header
 * - icon: the heart alone
 * `onDark` switches to white wordmark and blush heart for dark backgrounds.
 */
export function Logo({
  variant = "primary",
  onDark = false,
  className = "",
}: {
  variant?: LogoVariant;
  onDark?: boolean;
  className?: string;
}) {
  const s = sizes[variant];
  const heartColor = onDark ? "var(--color-accent-soft)" : "var(--color-accent)";
  const wordColor = onDark ? "text-white" : "text-accent";

  if (variant === "icon") {
    return (
      <HeartMark
        size={s.heart}
        color={heartColor}
        title={siteConfig.brand.name}
        className={className}
      />
    );
  }

  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span className="inline-flex items-center gap-2">
        <HeartMark size={s.heart} color={heartColor} />
        <span className={`font-display leading-none font-black ${s.word} ${wordColor}`}>
          {siteConfig.brand.name}
        </span>
      </span>
      {variant === "slogan" && (
        <span
          className={`mt-3 font-display text-xl font-medium md:text-2xl ${onDark ? "text-white/85" : "text-ink"}`}
        >
          {siteConfig.brand.slogan}
        </span>
      )}
    </span>
  );
}
