import Image from "next/image";
import { siteConfig } from "@/config/site";

export type LogoVariant = "full" | "wordmark" | "icon";

const files = {
  full: "/brand/likey-logo.png",
  fullLight: "/brand/likey-logo-light.png",
  wordmark: "/brand/likey-logo-wordmark.png",
  icon: "/brand/likey-tags.png",
} as const;

/**
 * The official Likey logo (artwork supplied by the brand, background removed).
 * - full:     tags + "likey" + slogan "יש לי משהו בשבילך"
 * - wordmark: tags + "likey", no slogan — for small sizes such as the header
 * - icon:     the two tags alone
 * `onDark` uses the light version, for dark backgrounds (full only).
 * `height` is the rendered height in px; width follows the artwork's proportions.
 */
export function Logo({
  variant = "full",
  onDark = false,
  height = 80,
  priority = false,
  className = "",
}: {
  variant?: LogoVariant;
  onDark?: boolean;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  const alt = `${siteConfig.brand.nameEn} ${siteConfig.brand.name} – ${siteConfig.brand.slogan}`;

  if (variant === "icon") {
    return (
      <Image
        src={files.icon}
        alt={`${siteConfig.brand.nameEn} ${siteConfig.brand.name}`}
        width={height}
        height={height}
        priority={priority}
        className={className}
      />
    );
  }

  // Artwork is 906 × 304.
  const width = Math.round((height * 906) / 304);
  const src = variant === "wordmark" ? files.wordmark : onDark ? files.fullLight : files.full;
  return (
    <Image
      src={src}
      alt={variant === "wordmark" ? `${siteConfig.brand.nameEn} ${siteConfig.brand.name}` : alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={`h-auto max-w-full ${className}`}
    />
  );
}
