import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "ניהול",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/businesses", label: "עסקים" },
  { href: "/admin/offers", label: "הטבות" },
  { href: "/admin/banners", label: "באנרים" },
  { href: "/admin/rewards", label: "מועדון ונקודות" },
  { href: "/admin/members", label: "חברות" },
  { href: "/admin/team", label: "צוות" },
];

// Server-side gate for the whole segment. Every admin action and every admin
// database function checks admin rights again on its own.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-6">
            <p className="font-bold text-accent">
              <span className="ltr">{siteConfig.brand.name}</span> · ניהול
            </p>
            <nav aria-label="ניווט ניהול">
              <ul className="flex flex-wrap gap-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-accent-soft hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-soft">
            <span>{session.profile.display_name ?? session.email}</span>
            <Link href="/account/password" className="hover:text-accent">
              שינוי סיסמה
            </Link>
            <Link href="/" className="hover:text-accent">
              לאתר ←
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
