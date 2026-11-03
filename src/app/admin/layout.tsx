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
  { href: "/admin/rewards", label: "מועדון ונקודות" },
];

// Server-side gate for the whole segment. Every admin action and every admin
// database function checks admin rights again on its own.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-6">
            <p className="font-bold text-plum">
              <span className="ltr">{siteConfig.brand.name}</span> · ניהול
            </p>
            <nav aria-label="ניווט ניהול">
              <ul className="flex gap-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-plum-soft hover:text-plum"
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
            <Link href="/" className="hover:text-plum">
              לאתר ←
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
