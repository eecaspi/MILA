import Image from "next/image";
import { siteConfig } from "@/config/site";

export type LogoVariant = "full" | "wordmark" | "icon";

const files = {
  full: "/brand/liky-logo.png",
  icon: "/brand/liky-icon.png",
} as const;

// The full artwork is 900 × 719.
const FULL_RATIO = 900 / 719;

/**
 * The official Liky logo (the red shopping bag), background removed.
 * - full:     the bag with "Liky" and the slogan "יש לי קישור בשבילך"
 * - wordmark: the bag alone, for the header (the bag already says Liky)
 * - icon:     the bag alone
 * `height` is the rendered height in px; width follows the artwork's proportions.
 * `onDark` is kept for older call sites: the logo is red on transparent, so it
 * belongs on light backgrounds.
 */
export function Logo({
  variant = "full",
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
  const name = `${siteConfig.brand.nameEn} ${siteConfig.brand.name}`;

  if (variant === "icon" || variant === "wordmark") {
    return (
      <Image
        src={files.icon}
        alt={name}
        width={Math.round(height * FULL_RATIO)}
        height={height}
        priority={priority}
        className={className}
      />
    );
  }

  const width = Math.round(height * FULL_RATIO);
  return (
    <Image
      src={files.full}
      alt={`${name} – ${siteConfig.brand.slogan}`}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={`h-auto max-w-full ${className}`}
    />
  );
}
