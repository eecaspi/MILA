import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppGate } from "@/components/auth/WhatsAppGate";
import { siteConfig } from "@/config/site";
import { getSession, safeNextPath } from "@/lib/auth/session";

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
  const session = await getSession();
  // The default sign-up destination is the personal area; right after joining she goes to the home page.
  const wanted = safeNextPath(next, "/");
  const to = wanted === "/account" || wanted.startsWith("/welcome") ? "/" : wanted;
  const whatsapp = siteConfig.community.whatsappUrl;
  const viaWhatsApp = channel !== "email";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {viaWhatsApp && whatsapp && (
        <WhatsAppGate url={whatsapp} userId={session?.userId ?? "guest"} />
      )}
      <div className="grid items-center overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] md:grid-cols-[1.1fr_1fr]">
        <Image
          src="/brand/liky-character-bag.jpg"
          alt="ליקי מחזיקה שקית של האתר ומזמינה אותך להיכנס"
          width={1536}
          height={1024}
          sizes="(min-width: 768px) 420px, 100vw"
          priority
          className="h-auto w-full"
        />
        <div className="px-6 pb-8 text-center md:px-8 md:py-10 md:text-start">
          <p className="eyebrow">ליקי</p>
          <h1 className="mt-1 text-3xl text-ink md:text-4xl">ברוכה הבאה לליקי!</h1>
          <p className="mt-1 text-2xl font-bold text-accent">את משלנו!</p>
          <p className="mt-3 text-lg text-ink-soft">
            החשבון שלך מוכן. מעכשיו קודי הקופון של העסקים מופיעים לך באתר, בכל הטבה.
          </p>

          {!viaWhatsApp && (
            <div className="mt-5 rounded-2xl bg-accent-soft p-4 text-start">
              <h2 className="text-lg text-ink">נשארות בקשר במייל</h2>
              <p className="mt-1 text-sm text-ink-soft">
                הוספנו אותך לרשימת העדכונים במייל. תקבלי הטבות חדשות והמלצות, ללא ספאם.
              </p>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
                >
                  יש לך וואטסאפ? אפשר להצטרף גם לקבוצה ←
                </a>
              )}
            </div>
          )}

          <Link href={to} className="btn-primary mt-6 w-full py-4 text-lg">
            המשיכי להטבות
          </Link>
        </div>
      </div>
    </div>
  );
}
