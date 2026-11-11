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
    <div className="absolute inset-0 flex items-stretch gap-1 overflow-hidden bg-[#f4eaec] px-3 sm:items-center sm:justify-center sm:gap-6 sm:px-10 md:px-20">
      <div
        key={playing ? "on" : "off"}
        className="relative z-10 my-auto flex w-[58%] shrink-0 flex-col gap-1.5 sm:w-[44%] sm:gap-3"
      >
        {bubbles.map((b, i) => (
          <p
            key={i}
            style={{ animationDelay: `${0.6 + i * 0.9}s` }}
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
      <div className="relative h-full w-[42%] shrink-0 self-end [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] sm:w-[40%]">
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
            className="absolute inset-0 size-full object-contain object-bottom"
          />
        ) : (
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 640px) 40vw, 42vw"
            priority={priority}
            className="object-contain object-bottom"
          />
        )}
      </div>
      <Link
        href={href}
        className="btn-primary absolute bottom-3 left-3 z-20 !px-4 !py-1.5 text-xs sm:bottom-5 sm:left-6 sm:!px-8 sm:!py-3 sm:text-lg"
      >
        {cta}
      </Link>
    </div>
  );
}
