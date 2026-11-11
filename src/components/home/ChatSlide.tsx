"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { isVideoUrl } from "@/lib/banners";

/**
 * Liky (a short looping clip) with a chat beside her: the headline and each line of the text
 * appear one after another, like a WhatsApp conversation, and play again and again. Everything
 * restarts from the beginning each time the slide comes into view.
 */
export function ChatSlide({
  image,
  alt,
  headline,
  text,
  href,
  cta,
  playing,
  priority = false,
}: {
  image: string;
  alt: string;
  headline: string;
  text: string;
  href: string;
  cta: string;
  playing: boolean;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // The last line of the text is shown as a button that leads to the deals.
  const ctaLabel = lines.length > 0 ? lines[lines.length - 1] : cta;
  const bubbles = [headline, ...(lines.length > 0 ? lines.slice(0, -1) : [])]
    .filter(Boolean)
    .slice(0, 5);
  const isVideo = isVideoUrl(image);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #f1eceb, #e9e7e8)" }}
    >
      {/* The clip fills the whole banner. */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            ref={videoRef}
            src={image}
            aria-label={alt}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="absolute inset-0 size-full object-cover object-[50%_35%]"
          />
        ) : (
          <Image
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            priority={priority}
            className="object-contain object-bottom"
          />
        )}
      </div>
      <div
        key={playing ? "on" : "off"}
        className="absolute right-8 top-8 z-10 flex w-[42%] flex-col gap-1 sm:right-36 sm:top-24 sm:w-[36%] sm:gap-3"
      >
        {bubbles.map((b, i) => (
          <div
            key={i}
            style={{ animationName: `chat-bubble-${i}` }}
            className={`chat-bubble flex w-fit items-end gap-2 sm:gap-3 max-w-full rounded-2xl px-2.5 py-1 text-[10px] leading-snug shadow-sm sm:px-5 sm:py-3 sm:text-xl ${
              i === 0
                ? "self-start rounded-ss-sm bg-white font-bold text-ink sm:text-3xl"
                : i % 2 === 1
                  ? "relative -left-7 self-end rounded-se-sm bg-[#f6b9b4] text-ink sm:left-0"
                  : "self-start rounded-ss-sm bg-white text-ink"
            }`}
          >
            <span>{b}</span>
            <span
              aria-hidden="true"
              className="ms-auto flex shrink-0 items-center gap-0.5 pb-px text-[7px] font-normal leading-none text-[#8696a0] sm:text-xs"
            >
              10:24
              <svg viewBox="0 0 16 11" className="h-[8px] w-[12px] sm:h-[12px] sm:w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5.8 4.2 9 10.8 1.6" />
                <path d="M7.2 8.6 7.6 9 14.4 1.6" />
              </svg>
            </span>
          </div>
        ))}
        <Link
          href={href}
          style={{ animationDelay: `${0.4 + 0.75 * bubbles.length}s, ${0.4 + 0.75 * bubbles.length + 0.5}s` }}
          className="chat-cta btn-primary mt-1.5 w-max max-w-none self-start whitespace-nowrap !px-5 !py-2.5 text-sm font-bold sm:mt-3 sm:!px-8 sm:!py-3 sm:text-2xl"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
