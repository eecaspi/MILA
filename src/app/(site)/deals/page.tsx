import type { Metadata } from "next";
import Link from "next/link";
import { DealCard } from "@/components/deals/DealCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, getCategory, isCategorySlug } from "@/data/categories";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { getMyCodes } from "@/lib/data/my-codes";
import { BusinessCard } from "@/components/business/BusinessCard";
import { SearchBox } from "@/components/ui/SearchBox";
import { getBusinesses, getOffers, getSearchHints, getSearchSuggestions } from "@/lib/data/repository";
import { searchBusinesses, searchOffers } from "@/lib/data/search";
import type { OfferKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "ליקי מצאה לך",
  description: "מבצעים, קופונים והטבות שליקי מצאה בשבילך.",
};

type SearchParams = Promise<{ category?: string; kind?: string; q?: string; channel?: string }>;

type Channel = "online" | "store";

function parseChannel(value: string | undefined): Channel | undefined {
  return value === "online" || value === "store" ? value : undefined;
}

function parseKind(value: string | undefined): OfferKind | undefined {
  return value === "deal" || value === "coupon" ? value : undefined;
}

export default async function DealsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = params.category && isCategorySlug(params.category) ? params.category : undefined;
  const kind = parseKind(params.kind);
  const q = (params.q ?? "").trim().slice(0, 60) || undefined;
  const channel = parseChannel(params.channel);
  const catName = (o: { business: { category: Parameters<typeof getCategory>[0] } }) =>
    getCategory(o.business.category).name;
  const found = searchOffers(
    (await getOffers({ category, kind })).filter(
      // "both" can be redeemed either way.
      (o) => !channel || o.redeemChannel === channel || o.redeemChannel === "both",
    ),
    q,
    catName,
  );
  const offers = found.items;
  // A search also looks at businesses, so a business name never ends in an empty page.
  const foundBusinesses = q
    ? searchBusinesses(await getBusinesses({ category }), q, (x) => getCategory(x.category).name)
    : { items: [], approximate: false };
  const matchingBusinesses = foundBusinesses.items;
  const [suggestions, hints] = await Promise.all([getSearchSuggestions(), getSearchHints()]);
  const signedIn = !!(await getSession());
  const codes = siteConfig.features.personalCodes
    ? { signedIn, mine: await getMyCodes() }
    : undefined;

  // Only show categories that actually have offers, so filters never lead to empty pages.
  const allOffers = await getOffers();
  const usedCategories = new Set(allOffers.map((o) => o.business.category));
  const hasChannels = allOffers.some((o) => o.redeemChannel);
  const filtered = !!(category || kind || channel || q);
  const showBusinesses = !kind && !channel;
  const total = offers.length + (showBusinesses ? matchingBusinesses.length : 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">מבצעים, קופונים והטבות</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">ליקי מצאה לך</h1>
        <p className="mt-2 text-ink-soft">כל מה ששווה לדעת עליו, במקום אחד.</p>
      </header>

      {offers.some((o) => o.status === "demo") && (
        <div className="mb-6">
          <DemoNotice>
            הצעות שמסומנות <strong>&quot;לדוגמה&quot;</strong> שייכות לעסקים פיקטיביים ואינן ניתנות
            למימוש. הצעות אמיתיות מופיעות עם התג &quot;הצעה מאומתת ✓&quot;.
          </DemoNotice>
        </div>
      )}

      <div className="mb-8 space-y-5 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)] md:p-6">
        <SearchBox suggestions={suggestions} hints={q ? [] : hints} defaultValue={q} hidden={{ category, kind, channel }} />

        <div className="space-y-3">
          <FilterChips
            basePath="/deals"
            param="category"
            label="מה בא לך למצוא היום?"
            current={category}
            otherParams={{ kind, channel, q }}
            options={[
              { value: undefined, label: "כל הקטגוריות" },
              ...categories
                .filter((c) => usedCategories.has(c.slug))
                .map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <FilterChips
            basePath="/deals"
            param="kind"
            label="סוג הטבה"
            current={kind}
            otherParams={{ category, channel, q }}
            options={[
              { value: undefined, label: "כל ההטבות" },
              { value: "deal", label: "מבצעים" },
              { value: "coupon", label: "קופונים" },
            ]}
          />
          {hasChannels && (
            <FilterChips
              basePath="/deals"
              param="channel"
              label="איפה ממשים"
              current={channel}
              otherParams={{ category, kind, q }}
              options={[
                { value: undefined, label: "אונליין ובחנות" },
                { value: "online", label: "אונליין" },
                { value: "store", label: "בחנות פיזית" },
              ]}
            />
          )}
        </div>
        {filtered && (
          <p className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <span>
              {total === 0
                ? "לא נמצאו תוצאות"
                : `נמצאו ${offers.length} הטבות${showBusinesses && matchingBusinesses.length > 0 ? ` ו־${matchingBusinesses.length} עסקים` : ""}`}
            </span>
            <Link href="/deals" className="font-semibold text-accent hover:underline">
              ניקוי הסינון
            </Link>
          </p>
        )}
      </div>

      {(found.approximate || foundBusinesses.approximate) && (
        <p className="mb-4 rounded-2xl bg-accent-soft px-4 py-3 text-ink">
          לא מצאתי בדיוק את מה שחיפשת, אלה התוצאות הכי קרובות.
        </p>
      )}

      {offers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <DealCard key={offer.id} offer={offer} codes={codes} />
          ))}
        </div>
      )}

      {showBusinesses && matchingBusinesses.length > 0 && (
        <section aria-labelledby="biz-results" className={offers.length > 0 ? "mt-12" : ""}>
          <h2 id="biz-results" className="mb-4 text-2xl text-ink">
            עסקים שמתאימים ל&quot;{q}&quot;
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchingBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          <p>
            {q
              ? `לא מצאתי משהו שמתאים ל"${q}". נסי מילה אחרת, או בחרי קטגוריה.`
              : "עוד לא מצאתי משהו שמתאים לסינון הזה. נסי קטגוריה אחרת?"}
          </p>
          <p className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/deals" className="btn-secondary">
              לכל ההטבות
            </Link>
            <Link href="/businesses" className="btn-secondary">
              לכל העסקים
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
