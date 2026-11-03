import Link from "next/link";
import { LikeyCharacter } from "@/components/brand/LikeyCharacter";
import { Logo } from "@/components/brand/Logo";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { ClubPreview } from "@/components/home/ClubPreview";
import { CommunityInvite } from "@/components/home/CommunityInvite";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses } from "@/components/ui/tones";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import {
  getBusinesses,
  getHighlightedOffers,
  getLikeyPicks,
  getNewestOffers,
} from "@/lib/data/repository";

export default async function HomePage() {
  const [best, newest, picks, businesses] = await Promise.all([
    getHighlightedOffers(4),
    getNewestOffers(4),
    getLikeyPicks(3),
    getBusinesses(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_10%,#f7dde6_0%,transparent_70%),radial-gradient(40%_50%_at_95%_90%,#fce3d4_0%,transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 md:grid-cols-[1.25fr_1fr] md:pt-16 md:pb-20">
          <div>
            <h1 className="sr-only">
              {siteConfig.brand.name} – {siteConfig.brand.slogan}
            </h1>
            <Logo variant="slogan" />
            <p className="mt-6 max-w-lg text-lg text-ink-soft md:text-xl">
              {siteConfig.brand.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/deals" className="btn-primary text-base">
                בואי לראות מה מצאתי לך
              </Link>
              <Link href="#community" className="btn-secondary text-base">
                הצטרפי לקהילה
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-soft">
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-coral" />
                בלי עלות
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-coral" />
                הכול במקום אחד
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-coral" />
                קהילה של נשים שמשתפות
              </li>
            </ul>
          </div>
          <div className="flex justify-center md:justify-end">
            <LikeyCharacter className="max-w-[18rem] md:max-w-sm" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4">
        {/* 1. המבצעים הכי שווים */}
        <section aria-labelledby="best">
          <SectionHeading
            id="best"
            title="המבצעים הכי שווים"
            subtitle="לייקי מצאה לך – ההטבות שהכי כדאי לא לפספס"
            href="/deals"
            linkLabel="בואי לראות הכול"
          />
          <div className="mb-6">
            <DemoNotice>
              ההצעות שמוצגות כרגע הן <strong>לדוגמה בלבד</strong> ושייכות לעסקים פיקטיביים. הצעות
              אמיתיות יסומנו בתג &quot;הצעה מאומתת&quot; אחרי אישור ישיר מול העסק.
            </DemoNotice>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {best.map((offer) => (
              <DealCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* 2. מה חדש + 3. לייקי ממליצה */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <section aria-labelledby="new">
            <SectionHeading id="new" title="מה חדש אצל לייקי?" subtitle="נכנס השבוע" />
            <div className="space-y-3">
              {newest.map((offer) => (
                <DealCard key={offer.id} offer={offer} layout="row" />
              ))}
            </div>
          </section>

          <section aria-labelledby="picks">
            <SectionHeading
              id="picks"
              title="לייקי ממליצה"
              subtitle="בחרתי במיוחד בשבילך, והנה למה"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {picks.slice(0, 2).map((offer) => (
                <DealCard key={offer.id} offer={offer} showPickNote />
              ))}
            </div>
          </section>
        </div>

        {/* 4. הקטגוריות שלנו */}
        <section aria-labelledby="cats">
          <SectionHeading id="cats" title="מה בא לך למצוא היום?" subtitle="הקטגוריות שלנו" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/businesses?category=${c.slug}`}
                  className={`lift flex h-full items-center gap-3 rounded-[var(--radius-card)] p-4 ${toneClasses[c.tone]}`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                    <CategoryIcon slug={c.slug} className="size-6 text-accent" />
                  </span>
                  <span className="font-display text-[15px] leading-tight font-bold">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. העסקים שלנו */}
        <section aria-labelledby="biz">
          <SectionHeading
            id="biz"
            title="העסקים שלנו"
            subtitle="עסקים וארגונים שכדאי להכיר"
            href="/businesses"
            linkLabel="לכל העסקים"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 6).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>

        {/* 6. החברות של לייקי */}
        <CommunityInvite />

        {/* 7. מועדון לייקי */}
        <ClubPreview />
      </div>
    </>
  );
}
