"use client";

import { useEffect, useState } from "react";
import { readFavorites, toggleFavorite } from "@/lib/favorites";

/** A heart that saves the offer on this device (no account needed). */
export function FavoriteButton({
  offerId,
  className = "",
}: {
  offerId: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavorites().includes(offerId));
    sync();
    window.addEventListener("liky-favorites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("liky-favorites", sync);
      window.removeEventListener("storage", sync);
    };
  }, [offerId]);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(offerId)}
      aria-pressed={saved}
      aria-label={saved ? "הסרה מהמועדפים" : "שמירה במועדפים"}
      className={`flex size-10 items-center justify-center rounded-full bg-surface/95 shadow-[var(--shadow-soft)] transition-transform hover:scale-110 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={saved ? "fill-accent text-accent" : "fill-none text-ink-soft"} stroke="currentColor">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
