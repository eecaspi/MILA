import Link from "next/link";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getBusinesses, getFeaturedOffers } from "@/lib/data/repository";

export default async function HomePage() {
  const [offers, businesses] = await Promise.all([getFeaturedOffers(3), getBusinesses()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-plum text-white">
        <div
          aria-hidden
          className="absolute -top-24 -start-24 size-96 rounded-full bg-gold/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm">
            ברוכות הבאות ל־<span className="ltr font-bold">{siteConfig.brand.name}</span>
          </p>
          <h1 className="max-w-2xl text-4xl leading-tight font-extrabold md:text-5xl">
            {siteConfig.brand.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">{siteConfig.brand.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/deals"
              className="rounded-full bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              למבצעים ולקופונים
            </Link>
            <Link
              href="/businesses"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
            >
              למדריך העסקים
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-12">
        {/* Categories */}
        <section aria-labelledby="cats">
          <h2 id="cats" className="sr-only">
            קטגוריות
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/businesses?category=${c.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 transition-colors hover:border-plum/40"
                >
                  <span aria-hidden className="text-2xl">
                    {c.icon}
                  </span>
                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Featured deals */}
        <section>
          <SectionHeading
            title="הטבות נבחרות"
            subtitle="מבצעים וקופונים לחברות הקהילה"
            href="/deals"
            linkLabel="לכל ההטבות"
          />
          <div className="mb-6">
            <DemoNotice>
              ההצעות שמוצגות כרגע הן <strong>לדוגמה בלבד</strong> ושייכות לעסקים פיקטיביים. הצעות
              אמיתיות יסומנו בתג &quot;הצעה מאומתת&quot; לאחר אישור ישיר מול העסק.
            </DemoNotice>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {offers.map((offer) => (
              <DealCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* Directory preview */}
        <section>
          <SectionHeading
            title="מדריך העסקים"
            subtitle="עסקים וארגונים שכדאי להכיר"
            href="/businesses"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 6).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>

        {/* Community teaser */}
        <section className="grid items-center gap-6 rounded-[var(--radius-card)] border border-line bg-paper p-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-bold text-ink">המלצות מהקהילה</h2>
            <p className="mt-2 text-ink-soft">
              בקרוב: המלצות אמיתיות מנשים בקהילה על עסקים, אנשי מקצוע ושירותים — כדי שכל אחת תדע למי
              לפנות.
            </p>
          </div>
          <Link
            href="/community"
            className="justify-self-start rounded-full border border-plum px-5 py-2.5 font-semibold text-plum transition-colors hover:bg-plum-soft"
          >
            לפרטים
          </Link>
        </section>
      </div>
    </>
  );
}
