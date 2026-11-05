import Link from "next/link";
import { TagMark } from "@/components/brand/TagMark";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminShare } from "./AdminShare";
import { CardCode } from "./CardCode";
import { FavoriteButton } from "./FavoriteButton";
import { RedeemInfo } from "./RedeemInfo";
import { isExpired, isUpcoming, offerBadge, redeemChannelLabel } from "@/lib/data/mappers";
import { formatDate } from "@/lib/format";
import type { OfferWithBusiness } from "@/lib/types";
import { OfferImage } from "./OfferImage";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const kindLabel = { deal: "מבצע", coupon: "קופון" } as const;

/**
 * Offer card: image, benefit, business, title, price (only when real), CTA.
 * `layout="row"` is the compact horizontal version used for "מה חדש".
 */
export function DealCard({
  offer,
  layout = "card",
  showPickNote = false,
  codes,
}: {
  offer: OfferWithBusiness;
  layout?: "card" | "row";
  showPickNote?: boolean;
  /** Pass when personal codes are on: shows the "get a code" control on the card. */
  codes?: { signedIn: boolean; mine?: Record<string, { code: string; expiresAt: string }> };
}) {
  const href = `/deals/${offer.id}`;
  const isDemo = offer.status === "demo";
  const badge = offerBadge(offer);
  const canClaim =
    !!codes && !isDemo && !isExpired(offer.validUntil) && !isUpcoming(offer.startsOn);

  if (layout === "row") {
    return (
      <article className="lift relative flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-3 shadow-[var(--shadow-card)]">
        <OfferImage
          offer={offer}
          className="aspect-square w-24 shrink-0 rounded-2xl"
          sizes="96px"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink-soft">{offer.business.name}</p>
          <h3 className="truncate text-base text-ink">
            <Link href={href} className="after:absolute after:inset-0">
              {offer.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-bold text-accent">{offer.valueLabel}</p>
        </div>
        {isDemo && (
          <span className="shrink-0 self-start rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
            לדוגמה
          </span>
        )}
      </article>
    );
  }

  return (
    <article className="lift group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
      <div className="relative">
        <OfferImage offer={offer} className="aspect-[4/3]" />
        <span className="absolute start-2 top-2 max-w-[75%] rounded-xl bg-accent px-2.5 py-1 text-base font-extrabold leading-tight text-on-accent shadow-[var(--shadow-soft)] sm:start-3 sm:top-3 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-2xl">
          {offer.valueLabel}
        </span>
        <span className="absolute end-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {kindLabel[offer.kind]}
        </span>
        {!isDemo && <FavoriteButton offerId={offer.id} className="absolute bottom-3 end-3 z-10" />}
        {badge && (
          <span
            className={`absolute bottom-3 start-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-[var(--shadow-soft)] ${
              badge.tone === "hot" ? "bg-ink text-surface" : "bg-surface text-accent"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
          {offer.business.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.business.logoUrl}
              alt=""
              className="size-6 rounded-full border border-line object-cover"
            />
          )}
          {offer.business.name}
        </p>
        <h3 className="mt-1 text-base leading-snug text-ink sm:text-xl">{offer.title}</h3>
        {offer.priceLabel && <p className="mt-1 font-bold text-ink">{offer.priceLabel}</p>}

        {showPickNote && offer.likeyPick && (
          <p className="mt-3 flex gap-2 rounded-2xl bg-accent-soft/60 p-3 text-sm text-ink">
            <TagMark size={20} className="mt-0.5 shrink-0" />
            <span>{offer.likeyPick.note}</span>
          </p>
        )}

        <div className="mt-auto pt-3 sm:pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink">
            {isDemo && <StatusBadge status={offer.status} />}
            {isUpcoming(offer.startsOn) && offer.startsOn ? (
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <ClockIcon />
                מתחילה ב־{formatDate(offer.startsOn)}
              </span>
            ) : (
              offer.validUntil && (
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <ClockIcon />
                  בתוקף עד {formatDate(offer.validUntil)}
                </span>
              )
            )}
            {offer.usageLimit && (
              <span className="text-xs font-medium text-ink-soft">{offer.usageLimit}</span>
            )}
            {offer.redeemChannel && (
              <span className="rounded-full bg-raised px-2.5 py-0.5 text-xs font-semibold text-ink">
                {redeemChannelLabel[offer.redeemChannel]}
              </span>
            )}
          </div>
          {codes && canClaim && (
            <div className="relative z-10 mb-3">
              {offer.codeMode === "link" || offer.codeMode === "store" ? (
                <RedeemInfo
                  mode={offer.codeMode}
                  signedIn={codes.signedIn}
                  signupHref={`/login?mode=signup&next=${encodeURIComponent(href)}`}
                  url={offer.redeemUrl ?? offer.business.website}
                  offerId={offer.id}
                  businessId={offer.business.id}
                  compact
                />
              ) : (
                <CardCode
                  offerId={offer.id}
                  signedIn={codes.signedIn}
                  signupHref={`/login?mode=signup&next=${encodeURIComponent(href)}`}
                  initial={codes.mine?.[offer.id]}
                  mode={offer.codeMode ?? "fixed"}
                />
              )}
            </div>
          )}
          <AdminShare
            offer={offer}
            compact
            className="relative z-10 mb-3"
          />
          <Link
            href={href}
            className={`${codes && canClaim ? "btn-secondary" : "btn-primary"} w-full py-2.5 text-[15px] after:absolute after:inset-0`}
          >
            {codes && canClaim ? "לפרטי ההטבה" : "למימוש ההטבה"}
          </Link>
        </div>
      </div>
    </article>
  );
}
