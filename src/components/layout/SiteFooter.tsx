import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t sm:mt-24 border-line bg-accent-soft text-ink">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-3 sm:gap-10 sm:py-12 md:grid-cols-3">
        <div className="flex items-center justify-center gap-3 sm:block">
          <Logo variant="full" height={64} className="!h-12 !w-auto shrink-0 sm:!h-auto" />
          <p className="hidden max-w-xs text-sm text-ink-soft sm:mt-4 sm:block">{siteConfig.brand.tagline}</p>
        </div>

        <nav aria-label="ניווט תחתון" className="hidden sm:block">
          <p className="mb-1 text-sm font-display font-bold sm:mb-3 sm:text-base">לאן ממשיכים?</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:block sm:text-sm sm:space-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {siteConfig.features.memberSignup ? (
                <Link href="/login?mode=signup" className="text-ink-soft hover:text-accent">
                  בואי להיות חברה שלנו
                </Link>
              ) : (
                <Link href="/club" className="text-ink-soft hover:text-accent">
                  מועדון הלקוחות (בעבודה)
                </Link>
              )}
            </li>
          </ul>
        </nav>

        <div className="text-center text-[10px] leading-snug text-ink-soft sm:text-start sm:text-sm">
          <p className="mb-0.5 hidden font-display font-bold text-ink sm:mb-3 sm:block sm:text-base">שקיפות מלאה</p>
          <p>
            האתר בשלב הרצה. העסקים במדריך מוצגים על סמך מידע פומבי ובלי קשר מסחרי. הצעות שמסומנות
            &quot;לדוגמה&quot; שייכות לעסקים פיקטיביים ואינן ניתנות למימוש.
          </p>
        </div>
      </div>
      <div className="border-t border-accent/15 px-4 py-2 text-center text-[11px] sm:py-4 sm:text-xs text-ink-soft">
        <nav aria-label="עמודים משפטיים" className="mb-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 sm:mb-2 sm:gap-x-5 sm:gap-y-1">
          <Link href="/report-problem" className="hover:text-accent">נתקלת בבעיה באתר?</Link>
          <Link href="/terms" className="hover:text-accent">תנאי שימוש</Link>
          <Link href="/privacy" className="hover:text-accent">מדיניות פרטיות</Link>
          <Link href="/disclosure" className="hover:text-accent">גילוי נאות</Link>
          <Link href="/accessibility" className="hover:text-accent">הצהרת נגישות</Link>
        </nav>
        © {new Date().getFullYear()} {siteConfig.brand.name} · {siteConfig.brand.slogan}
      </div>
    </footer>
  );
}
