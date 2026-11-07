import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import type { OfferWithBusiness } from "@/lib/types";
import { ShareDialog } from "./ShareDialog";

/** The message that goes with the picture: the offer, the coupon code (when it is a fixed one) and the link. */
function buildMessage(offer: OfferWithBusiness, url: string): string {
  const until = offer.validUntil
    ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" }).format(new Date(offer.validUntil))
    : null;
  const fixedCode = offer.codeMode === "fixed" || offer.codeMode === undefined ? offer.couponCode : undefined;
  return [
    `🎁 ${offer.valueLabel} ב${offer.business.name}`,
    offer.title,
    until ? `⏰ בתוקף עד ${until}` : null,
    "",
    fixedCode ? `🏷️ קוד קופון (לחיצה ארוכה להעתקה):\n\`\`\`${fixedCode}\`\`\`` : null,
    "",
    `👇 לפרטים ולמימוש באתר ליקי`,
    url,
  ]
    .filter((x) => x !== null)
    .join("\n");
}

/**
 * "Share to the WhatsApp group" for admins only: a picture of the offer with all its details, a ready
 * message with the coupon code and the link, and buttons to send, download or copy. Nobody else sees it.
 */
export async function AdminShare({
  offer,
  compact = false,
  className = "",
}: {
  offer: OfferWithBusiness;
  compact?: boolean;
  className?: string;
}) {
  const session = await getSession();
  if (session?.profile.role !== "admin") return null;
  const path = `/deals/${offer.id}`;
  const url = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const fixedCode = offer.codeMode === "fixed" || offer.codeMode === undefined ? offer.couponCode : undefined;
  const mode = offer.codeMode ?? "fixed";
  const warning =
    mode === "fixed" && !offer.couponCode
      ? "אין קוד קופון להטבה, ולכן ההודעה יוצאת בלי קוד. אפשר להוסיף קוד בעריכת ההטבה."
      : mode === "personal" || mode === "daily"
        ? "ההטבה מוגדרת כקוד אישי או יומי, ולכן הקוד לא נכלל בהודעה. כדי שהקוד יופיע בהודעה: עריכת ההטבה ← איך מממשים ← קוד קבוע."
        : undefined;
  return (
    <ShareDialog
      warning={warning}
      imagePath={`${path}/share-image`}
      message={buildMessage(offer, url)}
      code={fixedCode}
      url={url}
      compact={compact}
      className={className}
    />
  );
}
