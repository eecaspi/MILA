import type { Metadata } from "next";
import { DealCard } from "@/components/deals/DealCard";
import { FavoritesGrid } from "@/components/deals/FavoritesGrid";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { getMyCodes } from "@/lib/data/my-codes";
import { getOffers } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "המועדפים שלי",
  robots: { index: false },
};

export default async function FavoritesPage() {
  const offers = (await getOffers()).slice(0, 150);
  const signedIn = !!(await getSession());
  const codes = siteConfig.features.personalCodes
    ? { signedIn, mine: await getMyCodes() }
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">שמורות אצלך</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">המועדפים שלי</h1>
        <p className="mt-2 text-ink-soft">
          ההטבות שסימנת בלב. הן נשמרות במכשיר הזה, ואין צורך בחשבון.
        </p>
      </header>
      <FavoritesGrid
        items={offers.map((o) => ({ id: o.id, node: <DealCard offer={o} codes={codes} /> }))}
      />
    </div>
  );
}
