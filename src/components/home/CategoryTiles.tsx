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
          <li key={c.slug} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[19%]">
            <Link href={`/businesses?category=${c.slug}`} className="lift group block text-center">
              {c.image ? (
                <Image
                  src={c.image}
                  alt=""
                  width={520}
                  height={540}
                  sizes="(min-width: 1024px) 19vw, (min-width: 768px) 23vw, (min-width: 640px) 31vw, 46vw"
                  className="aspect-[26/27] w-full rounded-3xl bg-accent-soft object-cover"
                />
              ) : (
                <span className="flex aspect-[26/27] items-center justify-center rounded-3xl bg-accent-soft">
                  <CategoryIcon slug={c.slug} className="size-10 text-accent" />
                </span>
              )}
              <span className="mt-2 flex items-center justify-center gap-1.5 font-display text-base font-bold text-ink">
                <CategoryIcon slug={c.slug} className="size-5 text-accent" />
                {c.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
