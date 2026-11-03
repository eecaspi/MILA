import { useId } from "react";

/**
 * The לייקי brand symbol: a soft, slightly asymmetric heart with a small round
 * cut-out near its shoulder, like the hole of a price tag. Heart = caring;
 * tag = a find worth sharing. Works on its own as the app icon / avatar.
 *
 * The hole is a real cut-out (mask), so the mark sits cleanly on any background.
 */
export function HeartMark({
  size = 32,
  color = "var(--color-accent)",
  title,
  className,
}: {
  size?: number;
  color?: string;
  title?: string;
  className?: string;
}) {
  const maskId = `likey-heart-${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size * (44 / 48)}
      viewBox="0 0 48 44"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      <defs>
        <mask id={maskId}>
          <rect width="48" height="44" fill="white" />
          <circle cx="33.5" cy="13" r="3.4" fill="black" />
        </mask>
      </defs>
      <path
        mask={`url(#${maskId})`}
        fill={color}
        d="M24 41.5c-1.2 0-2.3-.4-3.2-1.2C11.6 32.6 2.5 25 2.5 14.6 2.5 7.6 7.8 2.5 14.3 2.5c4.1 0 7.4 2 9.7 5.2 2.3-3.2 5.6-5.2 9.7-5.2 6.5 0 11.8 5.1 11.8 12.1 0 10.4-9.1 18-18.3 25.7-.9.8-2 1.2-3.2 1.2z"
      />
    </svg>
  );
}
