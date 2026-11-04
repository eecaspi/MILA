import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses } from "@/components/ui/tones";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getBusinesses, getHighlightedOffers } from "@/lib/data/repository";

export default async function HomePage() {
  const [best, businesses] = await Promise.all([getHighlightedOffers(4), getBusinesses()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_50%_0%,#fde8e2_0%,transparent_70%),radial-gradient(40%_50%_at_90%_100%,#faeed8_0%,transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 pt-10 pb-12 text-center md:pt-14 md:pb-16">
          <h1 className="sr-only">
            {siteConfig.brand.name} – {siteConfig.brand.slogan}
          </h1>
          <Logo variant="full" height={140} priority />
          <p className="mt-6 max-w-md text-lg text-ink-soft md:text-xl">
            {siteConfig.brand.tagline}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/deals" className="btn-primary text-base">
              בואי לראות מה מצאתי לך
            </Link>
            <Link href="#community" className="btn-secondary text-base">
              הצטרפי לקהילה
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4">
        {/* המבצעים הכי שווים */}
        <section aria-labelledby="best">
          <SectionHeading
            id="best"
            title="המבצעים הכי שווים"
            subtitle="לייקי מצאה לך – ההטבות שהכי כדאי לא לפספס"
            href="/deals"
            linkLabel="בואי לראות הכול"
          />
          {/* Phones: swipeable row. Larger screens: grid. */}
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {best.map((offer) => (
              <li key={offer.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <DealCard offer={offer} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-soft">
            ההצעות שמוצגות כרגע הן לדוגמה בלבד. הצעות אמיתיות יסומנו &quot;הצעה מאומתת&quot; אחרי
            אישור ישיר מול העסק.
          </p>
        </section>

        {/* הקטגוריות */}
        <section aria-labelledby="cats">
          <SectionHeading id="cats" title="מה בא לך למצוא היום?" />
          <ul className="flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/businesses?category=${c.slug}`}
                  className="lift flex items-center gap-2 rounded-full border border-line bg-surface py-2 ps-2 pe-4 text-[15px] font-semibold text-ink hover:border-accent"
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClasses[c.tone]}`}
                  >
                    <CategoryIcon slug={c.slug} className="size-4 text-accent" />
                  </span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* העסקים שלנו */}
        <section aria-labelledby="biz">
          <SectionHeading
            id="biz"
            title="העסקים שלנו"
            subtitle="עסקים וארגונים שכדאי להכיר"
            href="/businesses"
            linkLabel="לכל העסקים"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 3).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>

        {/* החברות של לייקי */}
        <CommunityInvite />
      </div>
    </>
  );
}
