import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "ניהול",
  robots: { index: false, follow: false },
};

// Phase 2: protect this segment with Supabase auth + profiles.role = 'admin'.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <p className="font-bold text-plum">
            <span className="ltr">{siteConfig.brand.name}</span> · ניהול
          </p>
          <Link href="/" className="text-sm text-ink-soft hover:text-plum">
            לאתר ←
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
