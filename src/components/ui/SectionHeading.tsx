import Link from "next/link";

export function SectionHeading({
  id,
  title,
  subtitle,
  href,
  linkLabel = "לכל הרשימה",
}: {
  id?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-2xl text-ink md:text-3xl">
          {title}
        </h2>
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
