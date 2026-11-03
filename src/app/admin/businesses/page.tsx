import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { getCategory, isCategorySlug } from "@/data/categories";
import { createClient } from "@/lib/supabase/server";
import { setBusinessPublished } from "../content-actions";

interface Row {
  id: string;
  name: string;
  category_slug: string;
  area: string;
  status: string;
  is_published: boolean;
  is_real_business: boolean;
  logo_url: string | null;
  offers: { count: number }[];
}

type SearchParams = Promise<{ q?: string; show?: string; saved?: string; deleted?: string }>;

export default async function AdminBusinesses({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", show = "all", saved, deleted } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("businesses")
    .select(
      "id, name, category_slug, area, status, is_published, is_real_business, logo_url, offers(count)",
    )
    .eq("is_real_business", true)
    .order("sort_order")
    .order("name");
  if (q.trim()) query = query.ilike("name", `%${q.trim().replace(/[%_,]/g, "")}%`);
  if (show === "published") query = query.eq("is_published", true);
  if (show === "drafts") query = query.eq("is_published", false);
  const { data, error } = await query;
  const rows = (data ?? []) as Row[];
  const returnTo = `/admin/businesses?q=${encodeURIComponent(q)}&show=${show}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">עסקים</h1>
        <Link href="/admin/businesses/new" className="btn-primary">
          + עסק חדש
        </Link>
      </div>
      {saved && <Alert tone="success">העסק נשמר.</Alert>}
      {deleted && <Alert tone="success">העסק נמחק.</Alert>}
      {error && <Alert tone="error">לא הצלחנו לטעון את רשימת העסקים.</Alert>}

      <form className="flex flex-wrap gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm"
        />
        <select
          name="show"
          defaultValue={show}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm"
        >
          <option value="all">הכול</option>
          <option value="published">מפורסמים</option>
          <option value="drafts">טיוטות</option>
        </select>
        <button className="btn-secondary">סינון</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-8 text-center text-ink-soft">
          אין עדיין עסקים כאן.{" "}
          <Link href="/admin/businesses/new" className="font-semibold text-accent">
            להוספת העסק הראשון
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
          {rows.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-3 p-4">
              {b.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                <img src={b.logo_url} alt="" className="size-10 rounded-xl object-cover" />
              ) : (
                <span className="size-10 rounded-xl bg-raised" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/businesses/${b.id}`}
                  className="font-semibold text-ink hover:text-accent"
                >
                  {b.name}
                </Link>
                <p className="text-xs text-ink-soft">
                  {isCategorySlug(b.category_slug)
                    ? getCategory(b.category_slug).name
                    : b.category_slug}
                  {b.area && ` · ${b.area}`} · {b.offers[0]?.count ?? 0} הטבות
                  {b.status === "verified" && " · מאומת"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  b.is_published ? "bg-sage-soft text-sage" : "bg-raised text-ink-soft"
                }`}
              >
                {b.is_published ? "מפורסם" : "טיוטה"}
              </span>
              <form action={setBusinessPublished}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="publish" value={String(!b.is_published)} />
                <input type="hidden" name="return_to" value={returnTo} />
                <button className="text-sm font-semibold text-accent hover:underline">
                  {b.is_published ? "הסתרה" : "פרסום"}
                </button>
              </form>
              <Link
                href={`/admin/businesses/${b.id}`}
                className="text-sm font-semibold text-accent hover:underline"
              >
                עריכה
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
