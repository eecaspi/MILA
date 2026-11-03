import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { NavLinks } from "./NavLinks";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label={`${siteConfig.brand.name} – לדף הבית`} className="shrink-0">
          <Logo variant="compact" />
        </Link>

        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <NavLinks variant="desktop" />
        </nav>

        <div className="flex items-center gap-2">
          {session?.profile.role === "admin" && (
            <Link
              href="/admin"
              className="hidden text-sm font-semibold text-ink-soft hover:text-accent sm:inline-block"
            >
              ניהול
            </Link>
          )}
          <Link
            href={session ? "/account" : "/login?mode=signup"}
            className="btn-primary px-4 py-2 text-sm shadow-none"
          >
            {session ? "האזור שלי" : "בואי להיות חברה שלנו"}
          </Link>

          {/* Mobile menu: native <details>, no JS needed. */}
          <details className="group relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full bg-surface shadow-[var(--shadow-card)] [&::-webkit-details-marker]:hidden">
              <span className="sr-only">תפריט</span>
              <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-ink">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <nav
              aria-label="ניווט ראשי"
              className="absolute end-0 mt-2 w-60 rounded-2xl bg-surface shadow-[var(--shadow-soft)]"
            >
              <NavLinks variant="mobile" />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
