import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "fashion", name: "אופנה", tone: "rose" },
  { slug: "baby-kids", name: "ילדים ותינוקות", tone: "sky" },
  { slug: "home", name: "בית ועיצוב", tone: "peach" },
  { slug: "beauty", name: "טיפוח ויופי", tone: "coral" },
  { slug: "food", name: "אוכל ומטבח", tone: "mint" },
  { slug: "gifts", name: "מתנות", tone: "lilac" },
  { slug: "leisure", name: "פנאי וחוויות", tone: "sand" },
  { slug: "events", name: "שמחות ואירועים", tone: "pearl" },
  { slug: "books-judaica", name: "ספרים ויודאיקה", tone: "sand" },
  { slug: "health-community", name: "בריאות וחסד", tone: "mint" },
];

const bySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: CategorySlug): Category {
  const category = bySlug.get(slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

export function isCategorySlug(value: string): value is CategorySlug {
  return bySlug.has(value as CategorySlug);
}
