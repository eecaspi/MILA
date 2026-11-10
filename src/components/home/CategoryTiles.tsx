"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
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
 * Square category cards in a row that slides sideways, with arrows: picture, then icon and name.
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
    "flex size-8 items-center md:size-9 justify-center rounded-full border border-ink/70 bg-surface text-ink transition-colors hover:bg-accent-soft";

  return (
    <div>
      <div className="mb-2 flex items-center justify-start gap-2 md:mb-3" dir="ltr">
        <button type="button" onClick={() => scroll(1)} aria-label="לקטגוריות הבאות" className={arrow}>
          <Chevron dir="next" />
        </button>
        <button type="button" onClick={() => scroll(-1)} aria-label="לקטגוריות הקודמות" className={arrow}>
          <Chevron dir="prev" />
        </button>
      </div>
      <ul
        ref={strip}
        className="-mx-4 flex snap-x snap-mandatory gap-2 sm:gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => (
          <li key={c.slug} className="w-[23%] shrink-0 snap-start sm:w-[22%] md:w-[17%] lg:w-[13.5%]">
            <Link
              href={`/businesses?category=${c.slug}`}
              aria-label={c.name}
              className="lift block overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface"
            >
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  width={400}
                  height={400}
                  sizes="(min-width: 1024px) 14vw, (min-width: 768px) 17vw, (min-width: 640px) 22vw, 23vw"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <span className="flex aspect-square flex-col items-center justify-center gap-1 px-1 text-center font-display text-[11px] font-bold leading-tight text-ink sm:gap-2 sm:text-sm">
                  <CategoryIcon slug={c.slug} className="size-6 text-accent sm:size-8" />
                  {c.name}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
