import type { Metadata } from "next";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, isCategorySlug } from "@/data/categories";
import { getBusinesses } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "העסקים שלנו",
  description: "עסקים, חנויות וארגוני חסד שליקי ממליצה להכיר.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function BusinessesPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory } = await searchParams;
  const category = rawCategory && isCategorySlug(rawCategory) ? rawCategory : undefined;
  const businesses = await getBusinesses({ category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">מדריך העסקים</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">העסקים שלנו</h1>
        <p className="mt-2 text-ink-soft">עסקים, חנויות וארגונים שכדאי להכיר.</p>
      </header>

      <div className="mb-6">
        <DemoNotice>
          הרישומים במדריך מבוססים על מידע פומבי ומוצגים <strong>להדגמה בלבד</strong>. אין לליקי קשר
          מסחרי עם העסקים האלה, והפרטים טרם אומתו מולם.
        </DemoNotice>
      </div>

      <div className="mb-8">
        <FilterChips
          basePath="/businesses"
          param="category"
          label="מה בא לך למצוא היום?"
          current={category}
          options={[
            { value: undefined, label: "הכול" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      {businesses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          עוד אין כאן עסקים – אני כבר מחפשת בשבילך.
        </p>
      )}
    </div>
  );
}
