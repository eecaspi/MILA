import Link from "next/link";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "לכל הרשימה",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-ink md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-accent hover:underline">
          {linkLabel} ←
        </Link>
      )}
    </div>
  );
}
