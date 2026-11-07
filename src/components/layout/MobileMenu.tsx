"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Phone menu: opens with the three lines, closes on a tap anywhere else, on Escape or after choosing a page. */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const close = () => ref.current?.removeAttribute("open");
    const onPointer = (e: Event) => {
      const el = ref.current;
      if (el?.open && e.target instanceof Node && !el.contains(e.target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    ref.current?.removeAttribute("open");
  }, [pathname]);

  return (
    <details ref={ref} className="group relative lg:hidden">
      <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full bg-surface shadow-[var(--shadow-card)] [&::-webkit-details-marker]:hidden">
        <span className="sr-only">תפריט</span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-ink">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </summary>
      <nav
        aria-label="ניווט ראשי"
        className="absolute end-0 mt-2 w-60 rounded-2xl bg-surface shadow-[var(--shadow-soft)]"
      >
        {children}
      </nav>
    </details>
  );
}
