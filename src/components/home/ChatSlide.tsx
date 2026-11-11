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
  const bubbles = [headline, ...lines].filter(Boolean).slice(0, 6);
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
        className="absolute right-6 top-6 z-10 flex w-[46%] flex-col gap-1.5 sm:right-24 sm:top-14 sm:w-[36%] sm:gap-3"
      >
        {bubbles.map((b, i) => (
          <p
            key={i}
            style={{ animationName: `chat-bubble-${i}` }}
            className={`chat-bubble w-fit max-w-full rounded-2xl px-3 py-1.5 text-[11px] leading-snug shadow-sm sm:px-5 sm:py-3 sm:text-xl ${
              i === 0
                ? "self-start rounded-ss-sm bg-white font-bold text-accent sm:text-3xl"
                : i % 2 === 1
                  ? "self-end rounded-se-sm bg-[#fbd9dc] text-ink"
                  : "self-start rounded-ss-sm bg-white text-ink"
            }`}
          >
            {b}
          </p>
        ))}
      </div>
      <Link
        href={href}
        className="btn-primary absolute bottom-8 left-6 z-20 !px-4 !py-1.5 text-xs sm:bottom-16 sm:left-20 sm:!px-8 sm:!py-3 sm:text-lg"
      >
        {cta}
      </Link>
    </div>
  );
}
