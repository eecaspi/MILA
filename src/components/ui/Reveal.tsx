"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades and lifts its content into place when it scrolls into view. Content is visible from the
 * start without JavaScript, and for people who prefer reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Milliseconds to wait before showing, to stagger neighbours. */
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"server" | "hidden" | "shown">("server");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setState("shown");
      return;
    }
    // Already on screen when the page loads: no need to hide it first.
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.9) {
      setState("shown");
      return;
    }
    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: state === "shown" ? `${delay}ms` : "0ms" }}
      className={`${className} ${
        state === "hidden" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } transition-[opacity,transform] duration-700 ease-out`}
    >
      {children}
    </Tag>
  );
}
