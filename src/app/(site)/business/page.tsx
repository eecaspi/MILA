import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "העסק שלי",
  robots: { index: false },
};

interface OfferStat {
  id: string;
  title: string;
  value_label: string;
  status: string;
  valid_until: string | null;
  views: number;
  clicks: number;
  live_codes: number;
}
interface Stats {
  days: number;
  business_views: number;
  offers: OfferStat[];
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-accent-soft p-4 text-center">
      <p className="font-display text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default async function MyBusinessPage() {
  await requireSession("/business");
  const supabase = await createClient();
  const { data: mine } = await supabase.rpc("my_businesses");
  const businesses = (mine ?? []) as { id: string; name: string; slug: string }[];

  const stats = await Promise.all(
    businesses.map(async (b) => {
      const { data } = await supabase.rpc("business_stats", { p_business: b.id, p_days: 30 });
      return { business: b, stats: (data ?? null) as Stats | null };
    }),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <p className="eyebrow">אזור בעלי עסקים</p>
        <h1 className="mt-1 text-3xl text-ink">העסק שלי</h1>
      </header>

      {businesses.length === 0 && (
        <div className="rounded-[var(--radius-card)] bg-surface p-6 text-ink-soft shadow-[var(--shadow-card)]">
          <p className="font-bold text-ink">החשבון הזה עדיין לא מחובר לעסק.</p>
          <p className="mt-1 text-sm">
            בעלת עסק? פני אלינו והצוות של ליקי יחבר את החשבון שלך לעסק. אחרי החיבור יופיעו כאן הנתונים שלו.
          </p>
          <Link href="/for-businesses" className="btn-secondary mt-4 inline-flex px-5 py-2 text-sm">
            השארת פרטים לבעלי עסקים
          </Link>
        </div>
      )}

      {stats.map(({ business, stats: s }) => (
        <section key={business.id} className="space-y-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl text-ink">{business.name}</h2>
            <Link href="/businesses" className="text-sm font-semibold text-accent hover:underline">
              לעסקים באתר ←
            </Link>
          </div>
          {!s ? (
            <p className="text-sm text-ink-soft">לא הצלחנו לטעון את הנתונים. נסי שוב בעוד רגע.</p>
          ) : (
            <>
              <p className="text-sm text-ink-soft">נתונים מ־{s.days} הימים האחרונים</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Tile label="צפיות בעמוד העסק" value={s.business_views} />
                <Tile label="צפיות בהטבות" value={s.offers.reduce((a, o) => a + o.views, 0)} />
                <Tile label="לחיצות למימוש" value={s.offers.reduce((a, o) => a + o.clicks, 0)} />
                <Tile label="קודים פעילים עכשיו" value={s.offers.reduce((a, o) => a + o.live_codes, 0)} />
              </div>
              {s.offers.length === 0 ? (
                <p className="text-sm text-ink-soft">עדיין אין הטבות לעסק.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {s.offers.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{o.title}</p>
                        <p className="text-sm text-ink-soft">
                          {o.value_label}
                          {o.valid_until ? ` · עד ${formatDate(o.valid_until)}` : ""}
                        </p>
                      </div>
                      <p className="text-sm text-ink-soft">
                        {o.views} צפיות · {o.clicks} לחיצות · {o.live_codes} קודים פעילים
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-ink-soft">
                הנתונים אנונימיים ומוצגים רק לעסק שלך. הצעת הטבה חדשה או שינוי בהטבה קיימת מתבצעים מול הצוות של ליקי.
              </p>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
