import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";
import { signOut } from "@/app/(site)/login/actions";
import { getSession } from "@/lib/auth/session";
import { NavLinks } from "./NavLinks";

export async function SiteHeader() {
  const session = await getSession();
  const isOwner = session?.profile.role === "business_owner";
  const extra = isOwner ? [{ href: "/business", label: "העסק שלי" }] : [];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label={`${siteConfig.brand.name} – לדף הבית`} className="shrink-0">
          <Logo variant="wordmark" height={48} priority />
        </Link>

        <nav aria-label="ניווט ראשי" className="hidden lg:block">
          <NavLinks variant="desktop" extra={extra} />
        </nav>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <Link
              href="/for-businesses"
              className="hidden whitespace-nowrap rounded-full border border-accent/40 bg-accent-soft px-3.5 py-2 text-sm font-bold text-accent transition-colors hover:border-accent md:inline-block"
            >
              בעלי עסקים? פנו אלינו
            </Link>
          )}
          {session?.profile.role === "admin" && (
            <Link
              href="/admin"
              className="hidden text-sm font-semibold text-ink-soft hover:text-accent sm:inline-block"
            >
              ניהול
            </Link>
          )}
          {session ? (
            <>
              <Link
                href="/account"
                className="btn-primary px-4 py-2 text-sm whitespace-nowrap shadow-none"
              >
                האזור שלי
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="btn-secondary px-3 py-2 text-sm whitespace-nowrap shadow-none sm:px-4"
                >
                  <span className="sm:hidden">יציאה</span>
                  <span className="hidden sm:inline">התנתקות</span>
                </button>
              </form>
            </>
          ) : siteConfig.features.memberSignup ? (
            <Link
              href="/login?mode=signup"
              className="btn-primary px-4 py-2 text-sm whitespace-nowrap shadow-none"
            >
              <span className="sm:hidden">הצטרפי</span>
              <span className="hidden sm:inline">בואי להיות חברה שלנו</span>
            </Link>
          ) : (
            <Link
              href="/club"
              className="btn-primary gap-2 px-4 py-2 text-sm whitespace-nowrap shadow-none"
            >
              <span className="sm:hidden">המועדון</span>
              <span className="hidden sm:inline">כניסה למועדון הלקוחות</span>
              <span className="rounded-full bg-on-accent/20 px-2 py-0.5 text-[11px] font-bold">
                בעבודה
              </span>
            </Link>
          )}

          {/* Mobile menu: native <details>, no JS needed. */}
          <details className="group relative lg:hidden">
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
              <NavLinks
                variant="mobile"
                extra={extra}
                cta={isOwner ? undefined : { href: "/for-businesses", label: "בעלי עסקים? פנו אלינו" }}
              />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
