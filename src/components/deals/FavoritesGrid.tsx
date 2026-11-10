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
        <p className="font-display text-lg font-bold text-ink">עוד לא הוספת הטבות למועדפים.</p>
        <p className="mt-1">ראית הטבה שמצאה חן בעינייך? לחצי על הלב ושמרי אותה כאן לפעם הבאה.</p>
        <Link href="/deals" className="btn-primary mt-5">
          לגלות את ההטבות
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
