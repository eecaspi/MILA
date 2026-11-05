import type { Category, CategorySlug } from "@/lib/types";

export const categories: Category[] = [
  { slug: "fashion", name: "אופנה", tone: "rose", image: "/categories/fashion-card.jpg" },
  { slug: "baby-kids", name: "ילדים ותינוקות", tone: "sky", image: "/categories/baby-kids-card.jpg" },
  { slug: "home", name: "בית ועיצוב", tone: "peach", image: "/categories/home-card.jpg" },
  { slug: "beauty", name: "טיפוח ויופי", tone: "coral", image: "/categories/beauty-card.jpg" },
  { slug: "food", name: "אוכל ומטבח", tone: "mint", image: "/categories/food-card.jpg" },
  { slug: "gifts", name: "מתנות", tone: "lilac", image: "/categories/gifts-card.jpg" },
  { slug: "leisure", name: "פנאי וחוויות", tone: "sand", image: "/categories/leisure-card.jpg" },
  { slug: "events", name: "שמחות ואירועים", tone: "pearl", image: "/categories/events-card.jpg" },
  { slug: "books-judaica", name: "ספרים ויודאיקה", tone: "sand", image: "/categories/books-judaica-card.jpg" },
  { slug: "health-community", name: "בריאות וחסד", tone: "mint", image: "/categories/health-community-card.jpg" },
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
