import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t sm:mt-24 border-line bg-accent-soft text-ink">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:gap-10 sm:py-12 md:grid-cols-3">
        <div>
          <Logo variant="full" height={80} />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">{siteConfig.brand.tagline}</p>
        </div>

        <nav aria-label="ניווט תחתון">
          <p className="mb-3 font-display font-bold">לאן ממשיכים?</p>
          <ul className="space-y-2 text-sm">
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

        <div className="text-sm text-ink-soft">
          <p className="mb-3 font-display font-bold text-ink">שקיפות מלאה</p>
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
