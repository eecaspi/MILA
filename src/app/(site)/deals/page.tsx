import type { Metadata } from "next";
import Link from "next/link";
import { DealCard } from "@/components/deals/DealCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { FilterChips } from "@/components/ui/FilterChips";
import { categories, isCategorySlug } from "@/data/categories";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { getMyCodes } from "@/lib/data/my-codes";
import { getOffers } from "@/lib/data/repository";
import { matchesQuery } from "@/lib/data/search";
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
  const offers = (await getOffers({ category, kind }))
    .filter((o) => matchesQuery(o, q))
    // "both" can be redeemed either way.
    .filter((o) => !channel || o.redeemChannel === channel || o.redeemChannel === "both");
  const signedIn = !!(await getSession());
  const codes = siteConfig.features.personalCodes
    ? { signedIn, mine: await getMyCodes() }
    : undefined;

  // Only show categories that actually have offers, so filters never lead to empty pages.
  const allOffers = await getOffers();
  const usedCategories = new Set(allOffers.map((o) => o.business.category));
  const hasChannels = allOffers.some((o) => o.redeemChannel);
  const filtered = !!(category || kind || channel || q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">מבצעים, קופונים והטבות</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">ליקי מצאה לך</h1>
        <p className="mt-2 text-ink-soft">כל מה ששווה לדעת עליו, במקום אחד.</p>
      </header>

      <div className="mb-6">
        <DemoNotice>
          כל ההצעות בעמוד זה הן <strong>לדוגמה בלבד</strong>, שייכות לעסקים פיקטיביים ואינן ניתנות
          למימוש. הצעות אמיתיות יופיעו כאן עם התג &quot;הצעה מאומתת ✓&quot;.
        </DemoNotice>
      </div>

      <div className="mb-8 space-y-5 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)] md:p-6">
        <form action="/deals" role="search" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          {kind && <input type="hidden" name="kind" value={kind} />}
          {channel && <input type="hidden" name="channel" value={channel} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={60}
            placeholder="מה מחפשים? למשל: פאות, בגדי ילדים, תכשיטים"
            aria-label="חיפוש הטבות"
            className="min-w-0 flex-1 rounded-full border-2 border-line bg-canvas px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent md:text-lg"
          />
          <button type="submit" className="btn-primary px-7">
            חיפוש
          </button>
        </form>

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
              {offers.length === 0 ? "לא נמצאו הטבות" : offers.length === 1 ? "נמצאה הטבה אחת" : `נמצאו ${offers.length} הטבות`}
            </span>
            <Link href="/deals" className="font-semibold text-accent hover:underline">
              ניקוי הסינון
            </Link>
          </p>
        )}
      </div>

      {offers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <DealCard key={offer.id} offer={offer} codes={codes} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
          {q ? `לא מצאתי משהו שמתאים ל"${q}". נסי מילה אחרת?` : "עוד לא מצאתי משהו שמתאים לסינון הזה. נסי קטגוריה אחרת?"}
        </p>
      )}
    </div>
  );
}
