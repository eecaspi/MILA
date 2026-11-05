"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { categories } from "@/data/categories";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* In a right-to-left page "next" points left. */}
      <path d={dir === "next" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * Category cards in a swipeable row, with arrows. Each card is a picture with the category name on it.
 * Scrolling works by touch, trackpad and arrows, in the page's right-to-left direction.
 */
export function CategoryTiles() {
  const strip = useRef<HTMLUListElement>(null);

  function scroll(step: 1 | -1) {
    const el = strip.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: step * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow =
    "flex size-9 items-center justify-center rounded-full border border-ink/70 bg-surface text-ink transition-colors hover:bg-accent-soft";

  return (
    <div>
      <div className="mb-3 hidden items-center justify-start gap-2 md:flex" dir="ltr">
        <button type="button" onClick={() => scroll(1)} aria-label="לקטגוריות הבאות" className={arrow}>
          <Chevron dir="next" />
        </button>
        <button type="button" onClick={() => scroll(-1)} aria-label="לקטגוריות הקודמות" className={arrow}>
          <Chevron dir="prev" />
        </button>
      </div>
      <ul
        ref={strip}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => (
          <li key={c.slug} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-[30%] lg:w-[23.5%]">
            <Link
              href={`/businesses?category=${c.slug}`}
              className="lift group relative block aspect-[9/4] overflow-hidden rounded-3xl bg-accent-soft"
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 62vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3.5 font-display text-xl font-bold leading-tight text-white">
                {c.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
