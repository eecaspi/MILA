import { siteConfig } from "@/config/site";
import { TagMark } from "./TagMark";

export type LogoVariant = "framed" | "primary" | "compact" | "icon";

/**
 * Likey logo, rebuilt in code from the official artwork
 * (public/brand/likey-logo-reference.png) so it stays sharp and works on any background.
 * - framed:  tags on a champagne-gold frame, "Likey" script, slogan — the full logo
 * - primary: tags + "Likey" script
 * - compact: smaller lockup for the header
 * - icon:    the tags alone
 * `onDark` lightens the script and slogan for dark backgrounds.
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
  const script = onDark ? "rose-gold-text-light" : "rose-gold-text";
  const label = `${siteConfig.brand.nameEn} – ${siteConfig.brand.name}`;

  if (variant === "icon") {
    return <TagMark size={44} onDark={onDark} title={label} className={className} />;
  }

  if (variant === "framed") {
    return (
      <span
        role="img"
        aria-label={`${label}. ${siteConfig.brand.slogan}`}
        className={`relative inline-flex flex-col items-center border-[1.5px] border-t-0 border-gold px-8 pt-10 pb-5 sm:px-14 ${className}`}
      >
        {/* top edge in two parts, leaving a gap where the tags hang */}
        <span
          aria-hidden
          className="absolute -start-[1.5px] top-0 h-[1.5px] w-[calc(50%-46px)] bg-gold"
        />
        <span
          aria-hidden
          className="absolute -end-[1.5px] top-0 h-[1.5px] w-[calc(50%-46px)] bg-gold"
        />
        <span aria-hidden className="absolute -top-[32px] left-1/2 -translate-x-1/2">
          <TagMark size={70} onDark={onDark} />
        </span>
        <span
          aria-hidden
          className={`font-script text-[4.5rem] leading-[1.05] sm:text-[6rem] ${script}`}
        >
          {siteConfig.brand.nameEn.charAt(0) + siteConfig.brand.nameEn.slice(1).toLowerCase()}
        </span>
        <span
          aria-hidden
          className={`-mt-1 text-lg font-light tracking-wide sm:text-xl ${onDark ? "text-[#f0d9cf]" : "text-[#9a7a70]"}`}
        >
          {siteConfig.brand.slogan}
        </span>
      </span>
    );
  }

  const big = variant === "primary";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={label} role="img">
      <TagMark size={big ? 40 : 30} onDark={onDark} />
      <span
        aria-hidden
        className={`font-script leading-none ${big ? "text-[2.75rem]" : "text-[2.15rem]"} ${script}`}
      >
        {siteConfig.brand.nameEn.charAt(0) + siteConfig.brand.nameEn.slice(1).toLowerCase()}
      </span>
    </span>
  );
}
