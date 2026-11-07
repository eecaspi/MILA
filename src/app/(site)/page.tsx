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
          הטבות מעסקים מהקהילה, במקום אחד
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
            subtitle="ההטבות הבולטות, החדשות והאחרונות לפני שהן נגמרות"
            href="/deals"
            linkLabel="בואי לראות הכול"
          />
          <NowTabs
            tabs={[
              { id: "best", label: "הכי שווים", offers: now.best },
              { id: "fresh", label: "חדש", offers: now.fresh },
              { id: "ending", label: "מסתיים בקרוב", offers: now.ending },
            ]
              .filter((t) => t.offers.length > 0)
              .map((t) => ({
                id: t.id,
                label: t.label,
                node: (
                  <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                    {t.offers.map((offer) => (
                      <li key={offer.id} className="w-[47%] shrink-0 snap-start sm:w-auto">
                        <DealCard offer={offer} codes={codes} />
                      </li>
                    ))}
                  </ul>
                ),
              }))}
          />
          {[...now.best, ...now.fresh, ...now.ending].some((o) => o.status === "demo") && (
            <p className="mt-3 text-xs text-ink-soft">
              הצעות שמסומנות &quot;לדוגמה&quot; הן להמחשה בלבד. הצעות אמיתיות מסומנות &quot;הצעה
              מאומתת&quot; אחרי אישור ישיר מול העסק.
            </p>
          )}
        </section>

        <Reveal>
          <HowItWorks />
        </Reveal>

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
            {businesses.slice(0, 3).map((b, i) => (
              <Reveal key={b.id} delay={i * 120}>
                <BusinessCard business={b} />
              </Reveal>
            ))}
          </div>
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
