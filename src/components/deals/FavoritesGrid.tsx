"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readFavorites } from "@/lib/favorites";

/** Shows only the cards of offers saved on this device. The cards themselves come ready from the server. */
export function FavoritesGrid({ items }: { items: { id: string; node: React.ReactNode }[] }) {
  const [saved, setSaved] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setSaved(readFavorites());
    sync();
    window.addEventListener("liky-favorites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("liky-favorites", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (saved === null) return <p className="text-ink-soft">רגע, טוענת את המועדפים…</p>;
  const mine = items.filter((i) => saved.includes(i.id));
  if (mine.length === 0) {
    return (
      <div className="rounded-2xl bg-surface p-8 text-center text-ink-soft">
        <p>עוד לא שמרת הטבות. לחצי על הלב בכרטיס של הטבה כדי לשמור אותה כאן.</p>
        <Link href="/deals" className="btn-primary mt-5">
          לכל ההטבות
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mine.map((i) => (
        <div key={i.id}>{i.node}</div>
      ))}
    </div>
  );
}
