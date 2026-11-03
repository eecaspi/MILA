import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getBusinesses, getOffers } from "@/lib/data/repository";

export default async function AdminHome() {
  // Hidden until auth and admin roles are built (phase 2).
  if (!siteConfig.features.adminDashboard && process.env.NODE_ENV === "production") notFound();

  const [businesses, offers] = await Promise.all([
    getBusinesses({ includeSamples: true }),
    getOffers({ activeOnly: false }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">לוח ניהול</h1>
      <p className="text-ink-soft">
        תצוגה מקדימה לפיתוח בלבד. בשלב 2: התחברות, הרשאות מנהלת, וטפסים לניהול עסקים והצעות.
      </p>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <dt className="text-sm text-ink-soft">עסקים (כולל לדוגמה)</dt>
          <dd className="text-3xl font-bold text-plum">{businesses.length}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <dt className="text-sm text-ink-soft">הצעות</dt>
          <dd className="text-3xl font-bold text-plum">{offers.length}</dd>
        </div>
      </dl>
    </div>
  );
}
