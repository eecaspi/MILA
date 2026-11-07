import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t sm:mt-24 border-line bg-accent-soft text-ink">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:gap-10 sm:py-12 md:grid-cols-3">
        <div>
          <Logo variant="full" height={64} />
          <p className="mt-2 max-w-xs text-xs text-ink-soft sm:mt-4 sm:text-sm">{siteConfig.brand.tagline}</p>
        </div>

        <nav aria-label="ניווט תחתון">
          <p className="mb-2 font-display font-bold sm:mb-3">לאן ממשיכים?</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm sm:block sm:space-y-2">
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

        <div className="text-xs text-ink-soft sm:text-sm">
          <p className="mb-1 font-display font-bold text-ink sm:mb-3">שקיפות מלאה</p>
          <p>
            האתר בשלב הרצה. העסקים במדריך מוצגים על סמך מידע פומבי ובלי קשר מסחרי. הצעות שמסומנות
            &quot;לדוגמה&quot; שייכות לעסקים פיקטיביים ואינן ניתנות למימוש.
          </p>
        </div>
      </div>
      <div className="border-t border-accent/15 px-4 py-4 text-center text-xs text-ink-soft">
        <nav aria-label="עמודים משפטיים" className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1">
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
