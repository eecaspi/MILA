import Image from "next/image";

/** The two Likey tags from the official logo, used as a small brand symbol. */
export function TagMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/likey-tags.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
    />
  );
}
