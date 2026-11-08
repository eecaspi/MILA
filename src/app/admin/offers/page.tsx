import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { isExpired } from "@/lib/data/mappers";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setOfferPublished } from "../content-actions";

interface Row {
  id: string;
  title: string;
  value_label: string;
  kind: string;
  valid_until: string | null;
  is_published: boolean;
  highlight: boolean;
  unlisted?: boolean;
  businesses: { name: string; is_published: boolean } | null;
  offer_codes: { coupon_code: string } | null;
}

type SearchParams = Promise<{ q?: string; show?: string; saved?: string; deleted?: string }>;

export default async function AdminOffers({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", show = "all", saved, deleted } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("offers")
    .select(
      "id, title, value_label, kind, valid_until, is_published, highlight, unlisted, businesses!inner(name, is_published, is_real_business), offer_codes(coupon_code)",
    )
    .eq("businesses.is_real_business", true)
    .order("created_at", { ascending: false });
  if (q.trim()) query = query.ilike("title", `%${q.trim().replace(/[%_,]/g, "")}%`);
  if (show === "published") query = query.eq("is_published", true);
  if (show === "drafts") query = query.eq("is_published", false);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as Row[];
  const returnTo = `/admin/offers?q=${encodeURIComponent(q)}&show=${show}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">הטבות</h1>
        <Link href="/admin/offers/new" className="btn-primary">
          + הטבה חדשה
        </Link>
      </div>
      {saved && <Alert tone="success">ההטבה נשמרה.</Alert>}
      {deleted && <Alert tone="success">ההטבה נמחקה.</Alert>}
      {error && <Alert tone="error">לא הצלחנו לטעון את רשימת ההטבות.</Alert>}

      <form className="flex flex-wrap gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי כותרת"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm"
        />
        <select
          name="show"
          defaultValue={show}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm"
        >
          <option value="all">הכול</option>
          <option value="published">מפורסמות</option>
          <option value="drafts">טיוטות</option>
        </select>
        <button className="btn-secondary">סינון</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-8 text-center text-ink-soft">
          אין עדיין הטבות כאן.{" "}
          <Link href="/admin/offers/new" className="font-semibold text-accent">
            להוספת הטבה
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
          {rows.map((o) => {
            const expired = isExpired(o.valid_until);
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="rounded-xl bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent">
                  {o.value_label}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/offers/${o.id}`}
                    className="font-semibold text-ink hover:text-accent"
                  >
                    {o.title}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {o.businesses?.name}
                    {o.businesses && !o.businesses.is_published && " (העסק בטיוטה)"}
                    {o.valid_until && ` · עד ${formatDate(o.valid_until)}`}
                    {o.offer_codes && (
                      <>
                        {" "}
                        · קוד: <span className="ltr font-mono">{o.offer_codes.coupon_code}</span>
                      </>
                    )}
                    {o.highlight && " · מובלטת"}
                    {o.unlisted && " · לקבוצה בלבד"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    expired
                      ? "bg-danger-soft text-danger"
                      : o.is_published
                        ? "bg-sage-soft text-sage"
                        : "bg-raised text-ink-soft"
                  }`}
                >
                  {expired ? "פג תוקף" : o.is_published ? "מפורסמת" : "טיוטה"}
                </span>
                <form action={setOfferPublished}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="publish" value={String(!o.is_published)} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button className="text-sm font-semibold text-accent hover:underline">
                    {o.is_published ? "הסתרה" : "פרסום"}
                  </button>
                </form>
                <Link
                  href={`/admin/offers/${o.id}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  עריכה
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
