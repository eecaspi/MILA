import Link from "next/link";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { CharacterSlide } from "@/components/home/CharacterSlide";
import { FullImageSlide } from "@/components/home/FullImageSlide";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses } from "@/components/ui/tones";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getSession } from "@/lib/auth/session";
import { getBanners } from "@/lib/data/banners";
import { getMyCodes } from "@/lib/data/my-codes";
import { getBusinesses, getHighlightedOffers } from "@/lib/data/repository";

export default async function HomePage() {
  const [best, businesses, session, banners] = await Promise.all([
    getHighlightedOffers(4),
    getBusinesses(),
    getSession(),
    getBanners(),
  ]);
  const codes = siteConfig.features.personalCodes
    ? { signedIn: !!session, mine: await getMyCodes() }
    : undefined;

  const joinHref = siteConfig.features.memberSignup ? "/login?mode=signup" : "#community";
  const characterSlides = [
    <CharacterSlide
      key="hello"
      image="/brand/liky-character-bag.jpg"
      alt="ליקי עם שקית של האתר"
      headline="היי, אני ליקי"
      text="כאן לשירותך, עם ההטבות והמבצעים הכי שווים במקום אחד."
      href="/deals"
      cta="בואי לראות מה מצאתי לך"
      priority
    />,
    <FullImageSlide
      key="red"
      image="/brand/liky-banner-red.jpg"
      alt="ליקי, יש לי קישור בשבילך"
      href="/deals"
      cta="בואי לראות מה מצאתי לך"
    />,
    <CharacterSlide
      key="presenting"
      image="/brand/liky-presenting.jpg"
      alt="ליקי מציגה שקית של האתר"
      headline={siteConfig.brand.slogan}
      text="מצטרפות בחינם ומקבלות קוד קופון להטבות של העסקים."
      href={joinHref}
      cta="אני רוצה להצטרף"
    />,
    <CharacterSlide
      key="community"
      image="/brand/liky-podcast.jpg"
      alt="ליקי מספרת על ההטבות"
      headline="מציאה שווה? משתפות חברות."
      text="הקהילה שלנו בוואטסאפ מלאה בהמלצות אמיתיות מנשים כמוך."
      href="#community"
      cta="הצטרפי לקהילה"
      imageFirst
    />,
  ];

  return (
    <>
      {/* Hero: the Liky character slides, then the banners from the back office */}
      <h1 className="sr-only">
        {siteConfig.brand.name} – {siteConfig.brand.slogan}
      </h1>
      <HeroCarousel leading={characterSlides} banners={banners} />
      <div className="h-10" />

      <div className="mx-auto max-w-6xl space-y-16 px-4">
        {/* המבצעים הכי שווים */}
        <section aria-labelledby="best">
          <SectionHeading
            id="best"
            title="המבצעים הכי שווים"
            subtitle="ליקי מצאה לך – ההטבות שהכי כדאי לא לפספס"
            href="/deals"
            linkLabel="בואי לראות הכול"
          />
          {/* Phones: swipeable row. Larger screens: grid. */}
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {best.map((offer) => (
              <li key={offer.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
                <DealCard offer={offer} codes={codes} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-soft">
            ההצעות שמוצגות כרגע הן לדוגמה בלבד. הצעות אמיתיות יסומנו &quot;הצעה מאומתת&quot; אחרי
            אישור ישיר מול העסק.
          </p>
        </section>

        <HowItWorks />

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

        {/* החברות של ליקי */}
        <CommunityInvite />
      </div>
    </>
  );
}
