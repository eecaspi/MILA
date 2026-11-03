import Link from "next/link";
import { BarChart, type DailyPoint } from "@/components/admin/BarChart";
import { RankList } from "@/components/admin/RankList";
import { StatTile } from "@/components/admin/StatTile";
import { TrendTile } from "@/components/admin/TrendTile";
import { Alert } from "@/components/ui/Alert";
import { createClient } from "@/lib/supabase/server";

type Totals = {
  page_views: number;
  visitors: number;
  offer_views: number;
  outbound_clicks: number;
};
interface Analytics {
  days: number;
  totals: Totals;
  previous: Totals;
  daily: DailyPoint[];
  top_pages: { path: string; views: number }[];
  top_businesses: { id: string; name: string; views: number; clicks: number }[];
  top_offers: { id: string; title: string; business: string; views: number }[];
  referrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
}

const RANGES = [7, 30, 90] as const;

const pageNames: Record<string, string> = {
  "/": "עמוד הבית",
  "/deals": "לייקי מצאה לך",
  "/businesses": "העסקים שלנו",
  "/community": "החברות של לייקי",
};
function pageName(path: string) {
  if (pageNames[path]) return pageNames[path];
  if (path.startsWith("/deals/")) return `הטבה (${path.slice(7, 15)}…)`;
  return path;
}

const sourceNames: Record<string, string> = {
  direct: "ישירות / קישור שנשלח",
  whatsapp: "וואטסאפ",
  google: "גוגל",
  facebook: "פייסבוק",
  instagram: "אינסטגרם",
};
const deviceNames: Record<string, string> = {
  mobile: "נייד",
  desktop: "מחשב",
  tablet: "טאבלט",
  other: "אחר",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.find((d) => String(d) === daysParam) ?? 30;
  const supabase = await createClient();

  const [analytics, businesses, offers] = await Promise.all([
    supabase.rpc("admin_analytics", { p_days: days }),
    supabase.from("businesses").select("is_published"),
    supabase.from("offers").select("is_published"),
  ]);
  const a = analytics.data as Analytics | null;
  const bRows = (businesses.data ?? []) as { is_published: boolean }[];
  const oRows = (offers.data ?? []) as { is_published: boolean }[];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ink">סקירה</h1>
          <p className="text-sm text-ink-soft">כניסות לאתר ופעילות על העסקים וההטבות.</p>
        </div>
        <nav
          aria-label="טווח זמן"
          className="flex gap-1 rounded-full bg-surface p-1 shadow-[var(--shadow-card)]"
        >
          {RANGES.map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              aria-current={d === days ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                d === days ? "bg-accent text-on-accent" : "text-ink-soft hover:text-accent"
              }`}
            >
              {d} ימים
            </Link>
          ))}
        </nav>
      </div>

      {!a ? (
        <Alert tone="error">לא הצלחנו לטעון את נתוני הכניסות.</Alert>
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TrendTile label="מבקרות" value={a.totals.visitors} previous={a.previous.visitors} />
            <TrendTile
              label="צפיות בעמודים"
              value={a.totals.page_views}
              previous={a.previous.page_views}
            />
            <TrendTile
              label="צפיות בהטבות"
              value={a.totals.offer_views}
              previous={a.previous.offer_views}
            />
            <TrendTile
              label="יציאות לאתרי העסקים"
              value={a.totals.outbound_clicks}
              previous={a.previous.outbound_clicks}
            />
          </dl>

          <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-3 text-base text-ink">מבקרות לפי יום</h2>
            <BarChart data={a.daily} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <RankList
              title="עסקים: צפיות (יציאות לאתר)"
              rows={a.top_businesses.map((b) => ({
                label: b.name,
                sub: `${b.clicks} יציאות`,
                value: b.views,
              }))}
            />
            <RankList
              title="ההטבות הנצפות ביותר"
              rows={a.top_offers.map((o) => ({ label: o.title, sub: o.business, value: o.views }))}
            />
            <RankList
              title="עמודים נצפים"
              rows={a.top_pages.map((p) => ({ label: pageName(p.path), value: p.views }))}
            />
            <RankList
              title="מאיפה הגיעו"
              rows={a.referrers.map((r) => ({
                label: sourceNames[r.source] ?? r.source,
                value: r.visitors,
              }))}
            />
            <RankList
              title="מכשירים"
              rows={a.devices.map((d) => ({
                label: deviceNames[d.device] ?? d.device,
                value: d.visitors,
              }))}
            />
          </div>
          <p className="text-xs text-ink-soft">
            הנתונים אנונימיים: לא נשמרים כתובות IP או עוגיות. מבקרת נספרת פעם אחת ביום. גולשות
            שביקשו &quot;לא לעקוב&quot; בדפדפן לא נספרות.
          </p>
        </>
      )}

      <section className="space-y-3">
        <h2 className="text-lg text-ink">תוכן באתר</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="עסקים מפורסמים" value={bRows.filter((b) => b.is_published).length} />
          <StatTile label="עסקים בטיוטה" value={bRows.filter((b) => !b.is_published).length} />
          <StatTile label="הטבות מפורסמות" value={oRows.filter((o) => o.is_published).length} />
          <StatTile label="הטבות בטיוטה" value={oRows.filter((o) => !o.is_published).length} />
        </dl>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/businesses/new" className="btn-primary">
            + עסק חדש
          </Link>
          <Link href="/admin/offers/new" className="btn-secondary">
            + הטבה חדשה
          </Link>
        </div>
      </section>
    </div>
  );
}
