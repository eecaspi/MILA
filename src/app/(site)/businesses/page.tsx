import Link from "next/link";
import type { Metadata } from "next";
import { BusinessCard } from "@/components/business/BusinessCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, isCategorySlug } from "@/data/categories";
import { getBusinesses, getOffers } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "העסקים שלנו",
  description: "עסקים, חנויות וארגוני חסד שליקי ממליצה להכיר.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function BusinessesPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory } = await searchParams;
  const category = rawCategory && isCategorySlug(rawCategory) ? rawCategory : undefined;
  const [businesses, offers] = await Promise.all([getBusinesses({ category }), getOffers()]);
  const offersByBusiness = new Map<string, { id: string; title: string; valueLabel: string }[]>();
  for (const o of offers) {
    const list = offersByBusiness.get(o.businessId) ?? [];
    list.push({ id: o.id, title: o.title, valueLabel: o.valueLabel });
    offersByBusiness.set(o.businessId, list);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">מדריך העסקים</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">העסקים שלנו</h1>
        <p className="mt-2 text-ink-soft">עסקים, חנויות וארגונים שכדאי להכיר.</p>
      </header>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} offers={offersByBusiness.get(b.id)} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          עוד אין כאן עסקים – אני כבר מחפשת בשבילך.
        </p>
      )}

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] bg-accent-soft p-6">
        <div>
          <h2 className="text-xl text-ink md:text-2xl">בעלי עסקים? רוצים להופיע כאן?</h2>
          <p className="mt-1 text-ink-soft">השאירו פרטים ונחזור אליכם עם כל המידע.</p>
        </div>
        <Link href="/for-businesses" className="btn-primary px-6 py-2.5">
          פנו אלינו
        </Link>
      </section>
    </div>
  );
}
