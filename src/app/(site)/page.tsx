import Link from "next/link";
import { BusinessCard } from "@/components/business/BusinessCard";
import { DealCard } from "@/components/deals/DealCard";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses } from "@/components/ui/tones";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getBusinesses, getFeaturedOffers } from "@/lib/data/repository";

const clubSteps = [
  {
    title: "קונות דרך MILA",
    text: "צוברות נקודות על קניות מאומתות",
    tone: "rose" as const,
    icon: "🛍️",
  },
  {
    title: "משתתפות בקהילה",
    text: "נקודות על פעילויות והמלצות",
    tone: "lilac" as const,
    icon: "💜",
  },
  { title: "פותחות הטבות", text: "חנות ההטבות של MILA — בקרוב", tone: "mint" as const, icon: "🎁" },
];

export default async function HomePage() {
  const [offers, businesses] = await Promise.all([getFeaturedOffers(3), getBusinesses()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,rgba(246,169,189,0.28),transparent_70%),radial-gradient(45%_60%_at_0%_100%,rgba(205,184,245,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <p className="eyebrow">
            <span className="ltr">{siteConfig.brand.name}</span> · מועדון הקניות של הקהילה
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold text-ink md:text-6xl">
            {siteConfig.brand.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft md:text-xl">
            {siteConfig.brand.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/deals"
              className="rounded-full bg-accent px-7 py-3.5 text-base font-bold text-on-accent transition-colors hover:bg-accent-bright"
            >
              למבצעים ולקופונים
            </Link>
            <Link
              href="/businesses"
              className="rounded-full bg-surface px-7 py-3.5 text-base font-bold text-ink transition-colors hover:bg-raised"
            >
              למדריך העסקים
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4">
        {/* Categories: colorful tiles */}
        <section aria-labelledby="cats">
          <h2 id="cats" className="mb-5 text-2xl text-ink md:text-3xl">
            מה מחפשות היום?
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/businesses?category=${c.slug}`}
                  className={`flex h-28 flex-col justify-between rounded-[var(--radius-card)] p-4 transition-transform hover:-translate-y-0.5 ${toneClasses[c.tone].solid}`}
                >
                  <span aria-hidden className="text-2xl">
                    {c.icon}
                  </span>
                  <span className="text-base leading-tight font-extrabold">{c.name}</span>
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
          <div className="grid gap-4 md:grid-cols-3">
            {offers.map((offer) => (
              <DealCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* MILA CLUB */}
        <section className="accent-frame overflow-hidden rounded-[var(--radius-card)] p-6 md:p-10">
          <p className="eyebrow">MILA CLUB</p>
          <h2 className="mt-3 max-w-xl text-3xl text-ink md:text-4xl">
            מועדון שמתגמל אותך על כל קנייה חכמה
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {clubSteps.map((step) => (
              <li
                key={step.title}
                className={`rounded-[var(--radius-card)] p-5 ${toneClasses[step.tone].solid}`}
              >
                <span aria-hidden className="text-2xl">
                  {step.icon}
                </span>
                <p className="mt-3 text-lg font-extrabold">{step.title}</p>
                <p className="mt-1 text-sm font-medium opacity-80">{step.text}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/login?mode=signup"
            className="mt-8 inline-block rounded-full bg-accent px-7 py-3.5 text-base font-bold text-on-accent transition-colors hover:bg-accent-bright"
          >
            הצטרפות למועדון — ללא עלות
          </Link>
        </section>

        {/* Directory preview */}
        <section>
          <SectionHeading
            title="מדריך העסקים"
            subtitle="עסקים וארגונים שכדאי להכיר"
            href="/businesses"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 6).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>

        {/* Community teaser */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] bg-surface p-6 md:p-8">
          <div>
            <h2 className="text-2xl text-ink">המלצות מהקהילה</h2>
            <p className="mt-1 text-ink-soft">
              בקרוב: המלצות אמיתיות מנשים בקהילה על עסקים ואנשי מקצוע.
            </p>
          </div>
          <Link
            href="/community"
            className="rounded-full bg-raised px-5 py-2.5 font-bold text-ink transition-colors hover:bg-line"
          >
            לפרטים
          </Link>
        </section>
      </div>
    </>
  );
}
