import type { Metadata } from "next";
import { DealCard } from "@/components/deals/DealCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, isCategorySlug } from "@/data/categories";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getOffers } from "@/lib/data/repository";
import { forViewer } from "@/lib/data/visibility";
import type { OfferKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "לייקי מצאה לך",
  description: "מבצעים, קופונים והטבות שלייקי מצאה בשבילך.",
};

type SearchParams = Promise<{ category?: string; kind?: string }>;

function parseKind(value: string | undefined): OfferKind | undefined {
  return value === "deal" || value === "coupon" ? value : undefined;
}

export default async function DealsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = params.category && isCategorySlug(params.category) ? params.category : undefined;
  const kind = parseKind(params.kind);
  const session = await getSession();
  const offers = forViewer(await getOffers({ category, kind }), !!session);

  // Only show categories that actually have offers, so filters never lead to empty pages.
  const allOffers = await getOffers();
  const usedCategories = new Set(allOffers.map((o) => o.business.category));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">מבצעים, קופונים והטבות</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">לייקי מצאה לך</h1>
        <p className="mt-2 text-ink-soft">כל מה ששווה לדעת עליו, במקום אחד.</p>
      </header>

      {!session && (
        <p className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-ink">
          <span>
            <strong>ההטבות פתוחות לחברות לייקי.</strong> ההרשמה חינמית ולוקחת דקה.
          </span>
          <Link href="/login?mode=signup&next=/deals" className="btn-primary px-5 py-2 text-sm">
            הצטרפי בחינם
          </Link>
        </p>
      )}

      <div className="mb-6">
        <DemoNotice>
          כל ההצעות בעמוד זה הן <strong>לדוגמה בלבד</strong>, שייכות לעסקים פיקטיביים ואינן ניתנות
          למימוש. הצעות אמיתיות יופיעו כאן עם התג &quot;הצעה מאומתת ✓&quot;.
        </DemoNotice>
      </div>

      <div className="mb-8 space-y-3">
        <FilterChips
          basePath="/deals"
          param="kind"
          label="סוג הטבה"
          current={kind}
          otherParams={{ category }}
          options={[
            { value: undefined, label: "כל ההטבות" },
            { value: "deal", label: "מבצעים" },
            { value: "coupon", label: "קופונים" },
          ]}
        />
        <FilterChips
          basePath="/deals"
          param="category"
          label="מה בא לך למצוא היום?"
          current={category}
          otherParams={{ kind }}
          options={[
            { value: undefined, label: "הכול" },
            ...categories
              .filter((c) => usedCategories.has(c.slug))
              .map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      {offers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <DealCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          עוד לא מצאתי משהו שמתאים לסינון הזה. נסי קטגוריה אחרת?
        </p>
      )}
    </div>
  );
}
