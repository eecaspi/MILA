import { isExpired, isUpcoming, redeemChannelLabel } from "@/lib/data/mappers";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TagMark } from "@/components/brand/TagMark";
import { TrackView } from "@/components/analytics/Tracker";
import { CopyCouponButton } from "@/components/deals/CopyCouponButton";
import { AdminShare } from "@/components/deals/AdminShare";
import { FavoriteButton } from "@/components/deals/FavoriteButton";
import { OfferImage } from "@/components/deals/OfferImage";
import { PersonalCode } from "@/components/deals/PersonalCode";
import { RedeemInfo } from "@/components/deals/RedeemInfo";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { siteConfig } from "@/config/site";
import { getCategory } from "@/data/categories";
import { getSession } from "@/lib/auth/session";
import { getOfferById } from "@/lib/data/repository";
import { createClient } from "@/lib/supabase/server";
import { formatDate, hostname } from "@/lib/format";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ claim?: string }>;

/** The signed-in member's live code for this offer (row-level security shows only her own). */
async function myCode(offerId: string) {
  const session = await getSession();
  if (!session) return { signedIn: false, claim: null, wantsWhatsApp: false };
  const supabase = await createClient();
  const [{ data }, { data: auth }] = await Promise.all([
    supabase
      .from("code_claims")
      .select("code, expires_at")
      .eq("offer_id", offerId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  return {
    signedIn: true,
    claim: data ? { code: data.code as string, expiresAt: data.expires_at as string } : null,
    wantsWhatsApp: auth.user?.user_metadata?.community_channel === "whatsapp",
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const offer = await getOfferById((await params).id);
  return offer
    ? {
        title: `${offer.title} – ${offer.business.name}`,
        description: offer.description || `${offer.valueLabel} ב${offer.business.name}`,
        alternates: { canonical: `/deals/${offer.id}` },
        robots: offer.unlisted ? { index: false, follow: false } : undefined,
        openGraph: {
          title: `${offer.valueLabel} ב${offer.business.name}`,
          description: offer.title,
          images: [{ url: offer.imageUrl ?? "/brand/og.jpg" }],
        },
      }
    : { title: "ההטבה לא נמצאה" };
}

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const offer = await getOfferById((await params).id);
  if (!offer) notFound();

  const category = getCategory(offer.business.category);
  const isDemo = offer.status === "demo";
  const expired = isExpired(offer.validUntil);
  const upcoming = isUpcoming(offer.startsOn);
  const canClaim = siteConfig.features.personalCodes && !isDemo && !expired && !upcoming;
  const mine = canClaim ? await myCode(offer.id) : null;
  const problem = (await searchParams).claim;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <TrackView type="offer_view" offerId={offer.id} businessId={offer.business.id} />
      <Link href="/deals" className="text-sm font-semibold text-accent hover:underline">
        → לכל מה שליקי מצאה
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
            {offer.unlisted && (
              <span className="rounded-full border-2 border-accent bg-surface px-3 py-0.5 font-semibold text-accent">
                לחברות הקבוצה בלבד · עוד לא פורסם באתר
              </span>
            )}
            <span>{category.name}</span>
          </div>
          <div>
            <p className="font-semibold text-ink-soft">{offer.business.name}</p>
            <h1 className="mt-1 text-3xl text-ink md:text-4xl">{offer.title}</h1>
            {offer.priceLabel && (
              <p className="mt-2 text-xl font-bold text-ink">{offer.priceLabel}</p>
            )}
          </div>
          <AdminShare offer={offer} />
          <p className="text-lg text-ink-soft">{offer.description}</p>

          {offer.likeyPick && (
            <p className="flex gap-3 rounded-2xl bg-accent-soft/60 p-4 text-ink">
              <TagMark size={24} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-display">למה ליקי אוהבת את זה: </strong>
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

          {upcoming && offer.startsOn && (
            <p className="rounded-2xl bg-accent-soft/60 p-4 font-semibold text-ink">
              ההטבה הזאת מתחילה ב־{formatDate(offer.startsOn)}. אחרי שתיפתח אפשר יהיה לקבל כאן קוד.
            </p>
          )}

          {mine &&
            (offer.codeMode === "link" || offer.codeMode === "store" ? (
              !expired &&
              !upcoming &&
              !isDemo && (
                <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
                  <p className="mb-3 font-display font-bold text-ink">איך מממשים</p>
                  <RedeemInfo
                    mode={offer.codeMode}
                    signedIn={mine.signedIn}
                    signupHref={`/login?mode=signup&next=${encodeURIComponent(`/deals/${offer.id}`)}`}
                    url={offer.redeemUrl ?? offer.business.website}
                    offerId={offer.id}
                    businessId={offer.business.id}
                  />
                </div>
              )
            ) : (
              <PersonalCode
                offerId={offer.id}
                signedIn={mine.signedIn}
                claim={mine.claim}
                problem={problem}
                wantsWhatsApp={mine.wantsWhatsApp}
                mode={offer.codeMode ?? "fixed"}
              />
            ))}

          {siteConfig.features.showCouponCodes && offer.couponCode && !expired && (
            <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 font-display font-bold text-ink">קוד הקופון</p>
              <CopyCouponButton code={offer.couponCode} />
            </div>
          )}

          <dl className="grid gap-3 rounded-[var(--radius-card)] bg-surface p-5 text-sm shadow-[var(--shadow-card)]">
            {offer.redeemChannel && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">מימוש</dt>
                <dd className="font-semibold text-ink">{redeemChannelLabel[offer.redeemChannel]}</dd>
              </div>
            )}
            {offer.usageLimit && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">מגבלת שימוש</dt>
                <dd className="font-semibold text-ink">{offer.usageLimit}</dd>
              </div>
            )}
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
                    data-track-business={offer.business.id}
                    data-track-offer={offer.id}
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

          {offer.terms && (
            <div className="rounded-[var(--radius-card)] bg-surface p-5 text-sm shadow-[var(--shadow-card)]">
              <p className="mb-1 font-display font-bold text-ink">תנאים</p>
              <p className="whitespace-pre-line text-ink-soft">{offer.terms}</p>
            </div>
          )}

          {!expired && !upcoming && !isDemo && (
            <div className="flex flex-wrap items-center gap-3">
              <FavoriteButton offerId={offer.id} className="!bg-surface border border-line" />
              <span className="text-sm text-ink-soft">שמרי במועדפים</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
