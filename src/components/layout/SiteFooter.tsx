import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo variant="slogan" onDark className="[&>span:last-child]:text-lg" />
          <p className="mt-4 max-w-xs text-sm text-white/70">{siteConfig.brand.tagline}</p>
        </div>

        <nav aria-label="ניווט תחתון">
          <p className="mb-3 font-display font-bold">לאן ממשיכים?</p>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/75 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login?mode=signup" className="text-white/75 hover:text-white">
                בואי להיות חברה שלנו
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm text-white/75">
          <p className="mb-3 font-display font-bold text-white">שקיפות מלאה</p>
          <p>
            האתר בשלב הרצה. העסקים במדריך מוצגים על סמך מידע פומבי ובלי קשר מסחרי. הצעות שמסומנות
            &quot;לדוגמה&quot; שייכות לעסקים פיקטיביים ואינן ניתנות למימוש.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {siteConfig.brand.name} · {siteConfig.brand.slogan}
      </div>
    </footer>
  );
}
