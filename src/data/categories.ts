import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "food", name: "מזון וסופרמרקטים", icon: "🛒" },
  { slug: "fashion", name: "אופנה צנועה", icon: "👗" },
  { slug: "baby-kids", name: "תינוקות וילדים", icon: "🍼" },
  { slug: "home", name: "בית ומטבח", icon: "🏠" },
  { slug: "books-judaica", name: "ספרים ויודאיקה", icon: "📚" },
  { slug: "health-community", name: "בריאות וחסד", icon: "🤝" },
  { slug: "beauty", name: "טיפוח ופאות", icon: "💇‍♀️" },
  { slug: "events", name: "שמחות ואירועים", icon: "🎉" },
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
