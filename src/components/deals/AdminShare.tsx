import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { OfferWithBusiness } from "@/lib/types";
import { ShareDialog } from "./ShareDialog";

/** The message that goes with the picture: the offer, the coupon code (when it is a fixed one) and the link. */
function buildMessage(offer: OfferWithBusiness, url: string, fixedCode: string | undefined): string {
  const until = offer.validUntil
    ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" }).format(new Date(offer.validUntil))
    : null;
  return [
    offer.unlisted ? "⭐ בלעדי לחברות הקבוצה! ההטבה עוד לא באתר, ואתן הראשונות לקבל אותה" : null,
    offer.unlisted ? "" : null,
    `🎁 ${offer.valueLabel} ב${offer.business.name}`,
    offer.title,
    until ? `⏰ בתוקף עד ${until}` : null,
    "",
    fixedCode ? `🏷️ קוד קופון: ${fixedCode}` : null,
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
  const mode = offer.codeMode ?? "fixed";
  // The public offer data may hide the code, but the admin can always read it from the table.
  let couponCode = offer.couponCode;
  if (!couponCode && mode === "fixed") {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("offer_codes")
        .select("coupon_code")
        .eq("offer_id", offer.id)
        .maybeSingle();
      couponCode = (data?.coupon_code as string | undefined) ?? undefined;
    } catch {
      /* no code available */
    }
  }
  const fixedCode = mode === "fixed" ? couponCode : undefined;
  const warning =
    mode === "fixed" && !fixedCode
      ? "אין קוד קופון להטבה, ולכן ההודעה יוצאת בלי קוד. אפשר להוסיף קוד בעריכת ההטבה."
      : mode === "personal" || mode === "daily"
        ? "ההטבה מוגדרת כקוד אישי או יומי, ולכן הקוד לא נכלל בהודעה. כדי שהקוד יופיע בהודעה: עריכת ההטבה ← איך מממשים ← קוד קבוע."
        : undefined;
  return (
    <ShareDialog
      warning={warning}
      imagePath={`${path}/share-image`}
      message={buildMessage(offer, url, fixedCode)}
      code={fixedCode}
      url={url}
      compact={compact}
      className={className}
    />
  );
}
