"use client";

import { useEffect } from "react";

// For visitors who asked their device to reduce motion: stop every looping clip.
export function MotionGuard() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (!mq.matches) return;
      document.querySelectorAll("video").forEach((v) => {
        v.removeAttribute("autoplay");
        v.pause();
      });
    };
    stop();
    const obs = new MutationObserver(stop);
    obs.observe(document.body, { childList: true, subtree: true });
    mq.addEventListener("change", stop);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", stop);
    };
  }, []);
  return null;
}
