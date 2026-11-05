import Link from "next/link";

/**
 * Redeeming without a code: "link" offers go to the business's website, "store" offers
 * are redeemed at the physical store. Like codes, it is for registered members.
 */
export function RedeemInfo({
  mode,
  signedIn,
  signupHref,
  url,
  offerId,
  businessId,
  compact = false,
}: {
  mode: "link" | "store";
  signedIn: boolean;
  signupHref: string;
  /** Where "link" offers lead (the offer's own link, or the business website). */
  url?: string;
  offerId: string;
  businessId: string;
  compact?: boolean;
}) {
  const size = compact ? "py-2.5 text-[15px]" : "";

  if (!signedIn) {
    return (
      <div className="space-y-1.5">
        <Link
          href={signupHref}
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-accent bg-white py-2.5 text-[15px] font-bold text-accent transition hover:bg-accent-soft"
        >
          {mode === "link" ? "הצטרפי למימוש" : "הצטרפי והטבה בחנות"}
        </Link>
        <p className="text-center text-xs text-ink-soft">
          {mode === "link" ? "המימוש באתר העסק" : "ההטבה מתממשת בחנות הפיזית"}
        </p>
      </div>
    );
  }

  if (mode === "link") {
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        data-track-business={businessId}
        data-track-offer={offerId}
        className={`btn-primary w-full ${size}`}
      >
        למימוש באתר העסק ←
      </a>
    ) : null;
  }

  return (
    <p className="rounded-2xl bg-accent-soft/60 px-4 py-3 text-center text-sm font-semibold text-ink">
      ההטבה מתממשת בחנות הפיזית של העסק
    </p>
  );
}
