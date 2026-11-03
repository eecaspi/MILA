import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="ltr wordmark text-xl">{siteConfig.brand.name}</p>
          <p className="mt-2 text-sm text-ink-soft">{siteConfig.brand.tagline}</p>
        </div>

        <nav aria-label="ניווט תחתון">
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm text-ink-soft">
          <p className="font-semibold text-ink">שקיפות</p>
          <p className="mt-2">
            האתר בשלב הרצה. רישומי העסקים מבוססים על מידע פומבי ומוצגים להדגמה בלבד, ללא קשר מסחרי.
            ההצעות המסומנות &quot;לדוגמה&quot; אינן בתוקף ושייכות לעסקים פיקטיביים.
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {siteConfig.brand.name}
      </div>
    </footer>
  );
}
