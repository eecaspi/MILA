import Link from "next/link";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NowTabs } from "@/components/home/NowTabs";
import { Reveal } from "@/components/ui/Reveal";
import { SearchBox } from "@/components/ui/SearchBox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { getBanners } from "@/lib/data/banners";
import { getMyCodes } from "@/lib/data/my-codes";
import { getBusinesses, getNowOffers, getSearchSuggestions } from "@/lib/data/repository";

export default async function HomePage() {
  const [now, businesses, session, banners, suggestions] = await Promise.all([
    getNowOffers(4),
    getBusinesses(),
    getSession(),
    getBanners(),
    getSearchSuggestions(),
  ]);
  const codes = siteConfig.features.personalCodes
    ? { signedIn: !!session, mine: await getMyCodes() }
    : undefined;


  return (
    <>
      {/* Hero: banners managed in the back office (the Liky slides included) */}
      <h1 className="sr-only">
        {siteConfig.brand.name} – {siteConfig.brand.slogan}
      </h1>
      <HeroCarousel banners={banners} />
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <p className="mb-4 text-center font-display text-lg font-bold text-ink md:text-xl">
          הטבות והנחות לקהילה, במקום אחד
        </p>
        <SearchBox suggestions={suggestions} raised />
      </div>
      <div className="h-10" />

      <div className="mx-auto max-w-6xl space-y-16 px-4">
        {/* הקטגוריות */}
        <section aria-labelledby="cats">
          <SectionHeading id="cats" title="מה בא לך למצוא היום?" />
          <CategoryTiles />
        </section>

        {/* מה שווה עכשיו? */}
        <section aria-labelledby="best">
          <SectionHeading
            id="best"
            title="מה שווה עכשיו?"
            subtitle="הטבות שכדאי להכיר, מבצעים חדשים והזדמנויות לזמן מוגבל"
          />
          <NowTabs
            tabs={[
              { id: "best", label: "הכי שווים", offers: now.best },
              { id: "fresh", label: "חדש", offers: now.fresh },
              { id: "ending", label: "מסתיים בקרוב", offers: now.ending },
              { id: "soon", label: "בקרוב", offers: now.soon },
            ]
              .filter((t) => t.offers.length > 0)
              .map((t) => ({
                id: t.id,
                label: t.label,
                node: (
                  <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                    {t.offers.map((offer) => (
                      <li key={offer.id} className="w-[64%] shrink-0 snap-start sm:w-auto">
                        <DealCard offer={offer} codes={codes} />
                      </li>
                    ))}
                  </ul>
                ),
              }))}
          />
          <p className="mt-5 text-center">
            <Link href="/deals" className="btn-secondary !px-8 !py-3 text-lg">
              בואי לראות את כל ההטבות ←
            </Link>
          </p>
          {[...now.best, ...now.fresh, ...now.ending, ...now.soon].some((o) => o.status === "demo") && (
            <p className="mt-3 text-xs text-ink-soft">
              הצעות שמסומנות &quot;לדוגמה&quot; הן להמחשה בלבד. הצעות אמיתיות מסומנות &quot;הצעה
              מאומתת&quot; אחרי אישור ישיר מול העסק.
            </p>
          )}
        </section>

        {!session && (
          <Reveal>
            <HowItWorks />
          </Reveal>
        )}

        {/* העסקים שלנו */}
        <section aria-labelledby="biz">
          <SectionHeading
            id="biz"
            title="המותגים המועדפים על ליקי"
            subtitle="מותגים ועסקים שכדאי לכן להכיר."
          />
          <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {businesses.slice(0, 3).map((b, i) => (
              <li key={b.id} className="w-[64%] shrink-0 snap-start md:w-auto">
                <Reveal delay={i * 120} className="h-full">
                  <BusinessCard business={b} />
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center">
            <Link href="/businesses" className="btn-secondary !px-8 !py-3 text-lg">
              בואי לראות את כל העסקים ←
            </Link>
          </p>
        </section>

        {/* החברות של ליקי */}
        {!session && (
          <Reveal>
            <CommunityInvite />
          </Reveal>
        )}
      </div>
    </>
  );
}
