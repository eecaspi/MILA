import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "food", name: "מזון וסופרמרקטים", icon: "🛒", tone: "mint" },
  { slug: "fashion", name: "אופנה צנועה", icon: "👗", tone: "rose" },
  { slug: "baby-kids", name: "תינוקות וילדים", icon: "🍼", tone: "sky" },
  { slug: "home", name: "בית ומטבח", icon: "🏠", tone: "peach" },
  { slug: "books-judaica", name: "ספרים ויודאיקה", icon: "📚", tone: "sand" },
  { slug: "health-community", name: "בריאות וחסד", icon: "🤝", tone: "lilac" },
  { slug: "beauty", name: "טיפוח ופאות", icon: "💇‍♀️", tone: "coral" },
  { slug: "events", name: "שמחות ואירועים", icon: "🎉", tone: "pearl" },
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
