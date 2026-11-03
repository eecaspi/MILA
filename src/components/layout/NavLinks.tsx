"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  return (
    <ul className={variant === "desktop" ? "flex items-center gap-1" : "flex flex-col gap-1 p-2"}>
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "block rounded-full px-4 py-2 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-soft hover:bg-accent-soft/60 hover:text-accent",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
