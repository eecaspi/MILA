import type { Metadata } from "next";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, isCategorySlug } from "@/data/categories";
import { getBusinesses } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "מדריך עסקים",
  description: "עסקים, חנויות וארגוני חסד שכדאי להכיר.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function BusinessesPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory } = await searchParams;
  const category = rawCategory && isCategorySlug(rawCategory) ? rawCategory : undefined;
  const businesses = await getBusinesses({ category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink md:text-4xl">מדריך עסקים</h1>
        <p className="mt-2 text-ink-soft">עסקים, חנויות וארגונים שכדאי להכיר.</p>
      </header>

      <div className="mb-6">
        <DemoNotice>
          הרישומים במדריך מבוססים על מידע פומבי ומוצגים <strong>להדגמה בלבד</strong>. אין ל־
          <span className="ltr">MILA</span> קשר מסחרי עם העסקים האלה, והפרטים טרם אומתו מולם.
        </DemoNotice>
      </div>

      <div className="mb-8">
        <FilterChips
          basePath="/businesses"
          param="category"
          label="סינון לפי קטגוריה"
          current={category}
          options={[
            { value: undefined, label: "הכול" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      {businesses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          עדיין אין עסקים בקטגוריה הזו. בקרוב נוסיף עוד.
        </p>
      )}
    </div>
  );
}
