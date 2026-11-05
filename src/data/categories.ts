import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "fashion", name: "אופנה", tone: "rose", image: "/categories/fashion.jpg" },
  { slug: "baby-kids", name: "ילדים ותינוקות", tone: "sky", image: "/categories/baby-kids.jpg" },
  { slug: "home", name: "בית ועיצוב", tone: "peach", image: "/categories/home.jpg" },
  { slug: "beauty", name: "טיפוח ויופי", tone: "coral", image: "/categories/beauty.jpg" },
  { slug: "food", name: "אוכל ומטבח", tone: "mint", image: "/categories/food.jpg" },
  { slug: "gifts", name: "מתנות", tone: "lilac", image: "/categories/gifts.jpg" },
  { slug: "leisure", name: "פנאי וחוויות", tone: "sand", image: "/categories/leisure.jpg" },
  { slug: "events", name: "שמחות ואירועים", tone: "pearl", image: "/categories/events.jpg" },
  { slug: "books-judaica", name: "ספרים ויודאיקה", tone: "sand", image: "/categories/books-judaica.jpg" },
  { slug: "health-community", name: "בריאות וחסד", tone: "mint", image: "/categories/health-community.jpg" },
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
