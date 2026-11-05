import Link from "next/link";
import { siteConfig } from "@/config/site";
import { claimCode } from "@/app/(site)/deals/[id]/actions";
import { CopyCouponButton } from "./CopyCouponButton";

interface Props {
  offerId: string;
  signedIn: boolean;
  /** The member's live code for this offer, if she already asked for one. */
  claim: { code: string; expiresAt: string } | null;
  /** Result of the last attempt, from the URL. */
  problem?: string;
  /** She chose the WhatsApp group when signing up. */
  wantsWhatsApp: boolean;
  mode?: "fixed" | "personal" | "daily";
}

const problems: Record<string, string> = {
  limit: "אפשר להחזיק עד 3 קודים בו־זמנית, והם נמחקים אחרי 24 שעות. נסי שוב כשאחד מהם יפוג.",
  unavailable: "ההטבה הזאת כבר לא זמינה.",
  nocode: "הקוד עוד לא מוכן. נסי שוב בהמשך.",
  failed: "משהו השתבש. נסי שוב בעוד רגע.",
};

function hoursLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.max(0, Math.floor((ms % 3_600_000) / 60_000));
  return h > 0 ? `${h} שעות ו־${m} דקות` : `${m} דקות`;
}

export function PersonalCode({ offerId, signedIn, claim, problem, wantsWhatsApp, mode = "personal" }: Props) {
  const whatsapp = siteConfig.community.whatsappUrl;
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="font-display font-bold text-ink">{mode === "daily" ? "הקוד של היום" : mode === "fixed" ? "קוד ההטבה" : "הקוד האישי שלך"}</p>

      {claim ? (
        <div className="mt-3 space-y-3">
          <CopyCouponButton code={claim.code} />
          <p className="text-sm text-ink-soft">
            {mode === "daily"
              ? `הקוד תקף עד סוף היום (עוד ${hoursLeft(claim.expiresAt)}). מחר יהיה קוד חדש.`
              : mode === "fixed"
                ? "זה הקוד של העסק. הוא זהה לכל החברות ותקף כל עוד ההטבה בתוקף."
                : `הקוד אישי וחד־פעמי, ותקף עוד ${hoursLeft(claim.expiresAt)}. אחרי זה הוא נמחק.`}
          </p>
          {wantsWhatsApp && whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-accent hover:underline"
            >
              עוד לא בקבוצה? הצטרפי בוואטסאפ ←
            </a>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ink-soft">
            {mode === "daily"
              ? signedIn
                ? "זה הקוד של העסק להיום, ותקף עד סוף היום."
                : "ההרשמה לוקחת דקה, ואחריה רואים את הקוד של היום."
              : mode === "fixed"
                ? signedIn
                  ? "זה הקוד של העסק, זהה לכל החברות."
                  : "ההרשמה לוקחת דקה, ואחריה רואים את הקוד של ההטבה."
                : signedIn
                ? "הקוד נוצר רק בשבילך, חד־פעמי, ותקף ל־24 שעות."
                : "ההרשמה לוקחת דקה, ואחריה מקבלים קוד אישי וחד־פעמי, תקף ל־24 שעות."}
          </p>
          {problem && problems[problem] && (
            <p role="alert" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink">
              {problems[problem]}
            </p>
          )}
          {signedIn ? (
            <form action={claimCode}>
              <input type="hidden" name="offer_id" value={offerId} />
              <button type="submit" className="btn-primary w-full">
                {mode === "daily" ? "קבלי את הקוד של היום" : mode === "fixed" ? "קבלי את הקוד" : "קבלי קוד אישי"}
              </button>
            </form>
          ) : (
            <Link
              href={`/login?mode=signup&next=${encodeURIComponent(`/deals/${offerId}`)}`}
              className="btn-primary w-full"
            >
              הצטרפי וקבלי קוד
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
