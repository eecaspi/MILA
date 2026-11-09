"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { isVideoUrl } from "@/lib/banners";
import type { HomeBanner } from "@/lib/data/banners";
import { CharacterSlide } from "./CharacterSlide";
import { FullImageSlide } from "./FullImageSlide";

const IMAGE_MS = 6000;
const VIDEO_MS = 10000;

function Chevron({ dir }: { dir: "next" | "prev" }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* the site reads right to left: "next" points left */}
      <path d={dir === "next" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * The top of the home page: the banners from the back office (the Liky slides are banners too).
 * Swipe or use the arrows/dots; it also advances by itself, with a pause button, and does not
 * move on its own for people who asked their device for less motion.
 */
export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  const total = banners.length;
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setPaused(true);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const index = (i + total) % total;
      const slide = slideRefs.current[index];
      const strip = stripRef.current;
      if (!slide || !strip) return;
      // Scroll the strip itself (works the same in RTL) and never the page.
      strip.scrollBy({
        left: slide.getBoundingClientRect().left - strip.getBoundingClientRect().left,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [total, reduced],
  );

  // Which slide is in view.
  useEffect(() => {
    const els = slideRefs.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActive(els.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { threshold: [0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [total]);

  // Videos play only while their slide is showing.
  useEffect(() => {
    for (const list of [videoRefs.current, mobileVideoRefs.current]) {
      list.forEach((v, i) => {
        if (!v) return;
        if (i === active) void v.play().catch(() => {});
        else v.pause();
      });
    }
  }, [active]);

  // Advance by itself.
  useEffect(() => {
    if (total < 2 || paused || hovering) return;
    const isVideo = banners[active]?.type === "video";
    const t = setTimeout(() => goTo(active + 1), isVideo ? VIDEO_MS : IMAGE_MS);
    return () => clearTimeout(t);
  }, [active, paused, hovering, total, banners, goTo]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="הבאנר הראשי"
      className="relative w-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div ref={stripRef} className={`flex aspect-[2/1] w-full sm:aspect-auto snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:h-[340px] md:aspect-[16/6] md:h-auto md:max-h-[720px] [&::-webkit-scrollbar]:hidden`}>
        {banners.map((b, i) => {
          const n = i;
          const href = b.link ?? "/deals";
          const designed =
            b.layout === "character" || b.layout === "character_reverse" ? (
              <CharacterSlide
                image={b.url}
                alt={b.title ?? ""}
                headline={b.headline ?? b.title ?? ""}
                text={b.text ?? ""}
                href={href}
                cta={b.cta ?? "לפרטים נוספים"}
                imageFirst={b.layout === "character_reverse"}
                priority={i === 0}
              />
            ) : b.layout === "cover" ? (
              <FullImageSlide
                image={b.url}
                alt={b.title ?? ""}
                href={href}
                cta={b.cta ?? "לפרטים נוספים"}
                priority={i === 0}
              />
            ) : null;
          const renderMedia = (
            url: string,
            video: boolean,
            scale: number | undefined,
            refs: { current: (HTMLVideoElement | null)[] },
          ) =>
            video ? (
              <video
                ref={(el) => {
                  refs.current[n] = el;
                }}
                src={url}
                muted
                loop
                playsInline
                preload="metadata"
                className={`absolute inset-0 size-full ${shrunk(scale) ? "object-contain" : "object-cover object-top"}`}
                style={shrunk(scale) ? { transform: `scale(${scale! / 90})` } : undefined}
              />
            ) : (
              <>
                {/* The picture is shown whole; the same picture, blurred, fills the space around it. */}
                <Image
                  src={url}
                  alt=""
                  aria-hidden
                  fill
                  sizes="50vw"
                  className="scale-150 object-cover blur-3xl"
                />
                <Image
                  src={url}
                  alt={b.title ?? ""}
                  fill
                  sizes="100vw"
                  className={shrunk(scale) ? "object-contain" : "object-cover sm:object-contain"}
                  style={shrunk(scale) ? { transform: `scale(${scale! / 90})` } : undefined}
                  priority={false}
                />
              </>
            );
          const media = b.mobileUrl ? (
            <>
              <div className="absolute inset-0 hidden sm:block">
                {renderMedia(b.url, b.type === "video", b.scale, videoRefs)}
              </div>
              <div className="absolute inset-0 sm:hidden">
                {renderMedia(b.mobileUrl, isVideoUrl(b.mobileUrl), b.mobileScale, mobileVideoRefs)}
              </div>
            </>
          ) : (
            renderMedia(b.url, b.type === "video", b.scale, videoRefs)
          );
          const external = /^https?:/.test(href);
          // Every banner says something and has a button: its title (if any) and "לפרטים נוספים".
          const caption = (
            <span
              className={`absolute flex w-max max-w-[44%] flex-col gap-2 md:max-w-[32%] ${captionClass(b.pos)}`}
            >
              {(b.headline ?? b.title) && (
                <span className="rounded-2xl bg-surface/90 px-3 py-2 text-base font-bold leading-snug text-ink shadow-[var(--shadow-card)] sm:px-4 md:text-3xl">
                  {b.headline ?? b.title}
                </span>
              )}
              <span className="btn-primary !px-5 !py-2 text-sm sm:!px-7 sm:!py-3 sm:text-base">{b.cta ?? "לפרטים נוספים"}</span>
            </span>
          );
          return (
            <div
              key={b.id}
              ref={(el) => {
                slideRefs.current[n] = el;
              }}
              role="group"
              aria-roledescription="שקופית"
              aria-label={`${n + 1} מתוך ${total}`}
              className="relative w-full shrink-0 snap-start overflow-hidden bg-surface"
              style={(b.type === "video" && shrunk(b.scale)) || (b.mobileUrl && shrunk(b.mobileScale)) ? { backgroundColor: "#f3f1f1" } : undefined}
            >
              {designed ?? (
              <Link
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={`${b.title ?? "לפרטים נוספים"}`}
                className="absolute inset-0 block"
              >
                {media}
                {caption}
              </Link>
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="לשקופית הקודמת"
            className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-[var(--shadow-soft)] hover:bg-surface md:flex"
          >
            <Chevron dir="prev" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="לשקופית הבאה"
            className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-[var(--shadow-soft)] hover:bg-surface md:flex"
          >
            <Chevron dir="next" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
            <ul className="flex items-center gap-2 rounded-full bg-surface/85 px-3 py-2">
              {Array.from({ length: total }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`לשקופית ${i + 1}`}
                    aria-current={i === active}
                    className={`block h-2.5 rounded-full transition-all ${i === active ? "w-6 bg-accent" : "w-2.5 bg-ink-soft/40 hover:bg-ink-soft/70"}`}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "הפעלת ההחלפה האוטומטית" : "עצירת ההחלפה האוטומטית"}
              className="flex size-8 items-center justify-center rounded-full bg-surface/85 text-ink hover:bg-surface"
            >
              {paused ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

const SIDE_CLASS = {
  right: "start-[4%] items-start text-start",
  left: "end-[4%] items-start text-start",
  center: "start-1/2 -translate-x-1/2 items-center text-center",
} as const;
const VERT_CLASS = {
  top: "top-[12%] sm:top-[16%]",
  middle: "top-1/2 -translate-y-1/2",
  bottom: "bottom-[16%]",
} as const;

function captionClass(pos: string | undefined): string {
  const [side, vert] = (pos ?? "right-top").split("-") as [keyof typeof SIDE_CLASS, keyof typeof VERT_CLASS];
  return `${SIDE_CLASS[side] ?? SIDE_CLASS.right} ${VERT_CLASS[vert] ?? VERT_CLASS.top}`;
}

function shrunk(scale: number | undefined): boolean {
  return !!scale && scale < 100;
}
