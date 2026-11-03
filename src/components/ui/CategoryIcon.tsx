import type { CategorySlug } from "@/lib/types";

/** Simple line icons, one per category. 24×24, stroke = currentColor. */
const paths: Record<CategorySlug, React.ReactNode> = {
  fashion: (
    <>
      <path d="M9 3h6l-1.2 4.2L18 20H6l4.2-12.8L9 3z" />
      <path d="M9.6 9.5h4.8" />
    </>
  ),
  "baby-kids": (
    <>
      <path d="M10 7V5.5a2 2 0 0 1 4 0V7" />
      <path d="M8.5 7h7v11.5A2.5 2.5 0 0 1 13 21h-2a2.5 2.5 0 0 1-2.5-2.5V7z" />
      <path d="M8.5 11.5h3M8.5 15h3" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  beauty: (
    <>
      <path d="M11 3.5l1.7 4.3 4.3 1.7-4.3 1.7L11 15.5l-1.7-4.3L5 9.5l4.3-1.7L11 3.5z" />
      <path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </>
  ),
  food: (
    <>
      <path d="M4.5 11h15v5.5a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5V11z" />
      <path d="M2.5 11h2M19.5 11h2" />
      <path d="M9.5 7.5c0-1 1-1.2 1-2.3M13.5 7.5c0-1 1-1.2 1-2.3" />
    </>
  ),
  gifts: (
    <>
      <path d="M4.5 10.5h15V20h-15z" />
      <path d="M3.5 7.5h17v3h-17z" />
      <path d="M12 7.5V20" />
      <path d="M12 7.5c-1.5-3-5-3.5-5-1.5S10 7.5 12 7.5zM12 7.5c1.5-3 5-3.5 5-1.5S14 7.5 12 7.5z" />
    </>
  ),
  leisure: (
    <>
      <path d="M3.5 7h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4V7z" />
      <path d="M14.5 7v2M14.5 11v2M14.5 15v2" />
    </>
  ),
  "books-judaica": (
    <>
      <path d="M3.5 5H9a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5h-6V5z" />
      <path d="M20.5 5H15a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5h6V5z" />
    </>
  ),
  "health-community": (
    <>
      <path d="M12 15.5s-5-3-5-6.6A2.6 2.6 0 0 1 12 7.6a2.6 2.6 0 0 1 5 1.3c0 3.6-5 6.6-5 6.6z" />
      <path d="M3 18.5c2.5 0 3.8 1.8 9 1.8s6.5-1.8 9-1.8" />
    </>
  ),
  events: (
    <>
      <path d="M12 3.5a5 5 0 0 1 5 5c0 3.8-2.8 6.5-5 6.5s-5-2.7-5-6.5a5 5 0 0 1 5-5z" />
      <path d="M11.2 15h1.6l-.8 1.5z" />
      <path d="M12 16.5c0 1.8-2 2.2-2 4" />
    </>
  ),
};

export function CategoryIcon({
  slug,
  className = "size-6",
}: {
  slug: CategorySlug;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[slug]}
    </svg>
  );
}
