import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppGate } from "@/components/auth/WhatsAppGate";
import { siteConfig } from "@/config/site";
import { safeNextPath } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "ברוכה הבאה",
  robots: { index: false },
};

/** Shown right after sign-up: a big, friendly step that brings her into the community. */
export default async function Welcome({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; next?: string }>;
}) {
  const { channel, next } = await searchParams;
  const to = safeNextPath(next, "/deals");
  const whatsapp = siteConfig.community.whatsappUrl;
  const viaWhatsApp = channel !== "email";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 text-center">
      {viaWhatsApp && whatsapp && <WhatsAppGate url={whatsapp} />}
      <Logo variant="full" height={150} priority />
      <h1 className="mt-6 text-3xl text-ink md:text-4xl">ברוכה הבאה לליקי!</h1>
      <p className="mt-3 text-lg text-ink-soft">החשבון שלך מוכן. מעכשיו קודי הקופון של העסקים מופיעים לך באתר, בכל הטבה.</p>

      <div className="mt-8 w-full rounded-[var(--radius-card)] bg-accent-soft p-6 md:p-8">
        {viaWhatsApp ? (
          <>
            <h2 className="text-2xl text-ink">עוד צעד קטן: מצטרפות לקבוצה</h2>
            <p className="mt-2 text-ink-soft">
              ככה את מקבלת הטבות חדשות ישר לטלפון, והמלצות מנשים כמוך.
            </p>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 w-full py-4 text-lg"
              >
                הצטרפי לקבוצת הוואטסאפ
              </a>
            ) : (
              <p className="mt-6 rounded-full bg-surface px-6 py-3 font-bold text-ink-soft">
                הקבוצה נפתחת בקרוב
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl text-ink">נשארות בקשר במייל</h2>
            <p className="mt-2 text-ink-soft">
              הוספנו אותך לרשימת העדכונים במייל. תקבלי הטבות חדשות והמלצות, בלי ספאם.
            </p>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-semibold text-accent hover:underline"
              >
                יש לך וואטסאפ? אפשר להצטרף גם לקבוצה ←
              </a>
            )}
          </>
        )}
      </div>

      <Link
        href={to}
        className={`mt-6 w-full py-3 text-base ${viaWhatsApp ? "btn-secondary" : "btn-primary"}`}
      >
        המשיכי להטבות
      </Link>
    </div>
  );
}
