import { useId } from "react";

/**
 * The Likey symbol from the brand logo: two price tags hanging together —
 * a blush tag in front with a rose-gold edge, a champagne-gold outline tag behind.
 * A find worth sharing, between friends.
 */
export function TagMark({
  size = 40,
  onDark = false,
  title,
  className,
}: {
  size?: number;
  onDark?: boolean;
  title?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const edge = `likey-edge-${id}`;
  // One tag shape: pointed top, rounded corners, hole near the tip. 20 × 30 units.
  const tag =
    "M10 1.6c.7 0 1.4.3 1.9.8l6.6 7.2c.5.5.8 1.2.8 1.9V28c0 1.7-1.3 3-3 3H3.7c-1.7 0-3-1.3-3-3V11.5c0-.7.3-1.4.8-1.9L8.1 2.4c.5-.5 1.2-.8 1.9-.8z";

  return (
    <svg
      width={size}
      height={size * (40 / 44)}
      viewBox="0 0 44 40"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b5776e" />
          <stop offset="0.5" stopColor="#d9a596" />
          <stop offset="1" stopColor="#9a5e57" />
        </linearGradient>
      </defs>
      <g transform="translate(4 2) scale(0.82)">
        {/* back tag: gold outline */}
        <g transform="translate(22 6) rotate(-24 10 16)">
          <path
            d={tag}
            fill={onDark ? "transparent" : "#fffdfa"}
            stroke="#bfa585"
            strokeWidth="1.5"
          />
        </g>
        {/* front tag: blush fill, rose-gold edge, hole */}
        <g transform="translate(5 3) rotate(24 10 16)">
          <path d={tag} fill="#f5e4de" stroke={`url(#${edge})`} strokeWidth="1.7" />
          <circle cx="10" cy="8.2" r="2.2" fill="none" stroke={`url(#${edge})`} strokeWidth="1.6" />
        </g>
      </g>
    </svg>
  );
}
