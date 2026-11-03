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
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(201,164,92,0.18),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(201,164,92,0.08),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="eyebrow">
            <span className="ltr">{siteConfig.brand.name}</span> · מועדון הקניות של הקהילה
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.15] font-medium text-ink md:text-6xl">
            {siteConfig.brand.tagline}
          </h1>
          <div className="gold-rule mt-8" />
          <p className="mt-6 max-w-xl text-lg text-ink-soft">{siteConfig.brand.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/deals"
              className="rounded-full bg-gold px-7 py-3.5 font-semibold text-on-gold transition-colors hover:bg-gold-bright"
            >
              למבצעים ולקופונים
            </Link>
            <Link
              href="/businesses"
              className="rounded-full border border-gold/50 px-7 py-3.5 font-semibold text-gold transition-colors hover:border-gold hover:bg-gold-soft"
            >
              למדריך העסקים
            </Link>
          </div>
          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-ink-soft">קטגוריות</dt>
              <dd className="font-display text-2xl text-ink">{categories.length}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">עסקים במדריך</dt>
              <dd className="font-display text-2xl text-ink">{businesses.length}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">הצטרפות למועדון</dt>
              <dd className="font-display text-2xl text-gold">ללא עלות</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 pt-14">
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
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-gold/60"
                >
                  <span className="font-display text-base text-ink group-hover:text-gold">
                    {c.name}
                  </span>
                  <span
                    aria-hidden
                    className="text-gold/60 transition-colors group-hover:text-gold"
                  >
                    ←
                  </span>
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

        {/* MILA CLUB */}
        <section className="gold-frame relative overflow-hidden rounded-[var(--radius-card)] p-8 md:p-12">
          <p className="eyebrow">MILA CLUB</p>
          <h2 className="mt-4 max-w-xl text-3xl font-medium text-ink md:text-4xl">
            מועדון שמתגמל אותך על כל קנייה חכמה
          </h2>
          <div className="gold-rule mt-6" />
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            <li>
              <p className="font-display text-lg text-gold">קונות דרך MILA</p>
              <p className="mt-1 text-sm text-ink-soft">צוברות נקודות על קניות מאומתות.</p>
            </li>
            <li>
              <p className="font-display text-lg text-gold">משתתפות בקהילה</p>
              <p className="mt-1 text-sm text-ink-soft">נקודות על פעילויות והמלצות.</p>
            </li>
            <li>
              <p className="font-display text-lg text-gold">פותחות הטבות</p>
              <p className="mt-1 text-sm text-ink-soft">חנות ההטבות של MILA — בקרוב.</p>
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-gold px-7 py-3.5 font-semibold text-on-gold transition-colors hover:bg-gold-bright"
            >
              הצטרפות למועדון
            </Link>
            <Link href="/community" className="text-sm font-semibold text-ink-soft hover:text-gold">
              המלצות הקהילה — בקרוב
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
