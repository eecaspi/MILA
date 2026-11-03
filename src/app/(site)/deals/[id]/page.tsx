import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TagMark } from "@/components/brand/TagMark";
import { CopyCouponButton } from "@/components/deals/CopyCouponButton";
import { OfferImage } from "@/components/deals/OfferImage";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCategory } from "@/data/categories";
import { getOfferById } from "@/lib/data/repository";
import { formatDate, hostname } from "@/lib/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const offer = await getOfferById((await params).id);
  return offer
    ? { title: `${offer.title} – ${offer.business.name}`, description: offer.description }
    : { title: "ההטבה לא נמצאה" };
}

export default async function OfferPage({ params }: { params: Params }) {
  const offer = await getOfferById((await params).id);
  if (!offer) notFound();

  const category = getCategory(offer.business.category);
  const isDemo = offer.status === "demo";
  const expired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Link href="/deals" className="text-sm font-semibold text-accent hover:underline">
        → לכל מה שלייקי מצאה
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <OfferImage
            offer={offer}
            className="aspect-square"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <span className="absolute start-4 top-4 rounded-full bg-accent px-4 py-2 text-lg font-bold text-on-accent shadow-[var(--shadow-soft)]">
            {offer.valueLabel}
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <StatusBadge status={offer.status} />
            <span>{category.name}</span>
          </div>
          <div>
            <p className="font-semibold text-ink-soft">{offer.business.name}</p>
            <h1 className="mt-1 text-3xl text-ink md:text-4xl">{offer.title}</h1>
            {offer.priceLabel && (
              <p className="mt-2 text-xl font-bold text-ink">{offer.priceLabel}</p>
            )}
          </div>
          <p className="text-lg text-ink-soft">{offer.description}</p>

          {offer.likeyPick && (
            <p className="flex gap-3 rounded-2xl bg-accent-soft/60 p-4 text-ink">
              <TagMark size={24} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-display">למה לייקי אוהבת את זה: </strong>
                {offer.likeyPick.note}
              </span>
            </p>
          )}

          {isDemo && (
            <DemoNotice>
              זו <strong>הצעה לדוגמה</strong> של עסק פיקטיבי. היא מראה איך הטבות ייראו באתר, ואי
              אפשר לממש אותה.
            </DemoNotice>
          )}

          {offer.couponCode && !expired && (
            <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 font-display font-bold text-ink">קוד הקופון</p>
              <CopyCouponButton code={offer.couponCode} />
            </div>
          )}

          <dl className="grid gap-3 rounded-[var(--radius-card)] bg-surface p-5 text-sm shadow-[var(--shadow-card)]">
            {offer.validUntil && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">בתוקף עד</dt>
                <dd className="font-semibold text-ink">
                  {formatDate(offer.validUntil)}
                  {expired && " (הסתיים)"}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">איפה</dt>
              <dd className="font-semibold text-ink">{offer.business.area}</dd>
            </div>
            {offer.business.website && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">אתר העסק</dt>
                <dd>
                  <a
                    href={offer.business.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="ltr font-semibold text-accent hover:underline"
                  >
                    {hostname(offer.business.website)}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
