import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setInquiryStatus, setReportHandled } from "./actions";

type Inquiry = {
  id: string;
  created_at: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string | null;
  website: string | null;
  message: string | null;
  handled: boolean;
  status: string;
  admin_note: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  new: "חדשה",
  in_progress: "בטיפול",
  closed_ok: "נסגרה בהצלחה (העסק הצטרף)",
  closed_no: "נסגרה, לא מתקדמים",
  problem: "יש בעיה",
};

type Report = {
  id: string;
  created_at: string;
  name: string | null;
  contact: string;
  message: string;
  page: string | null;
  handled: boolean;
};

export default async function Inquiries() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_inquiries")
    .select("id, created_at, business_name, contact_name, phone, email, website, message, handled, status, admin_note")
    .order("handled")
    .order("created_at", { ascending: false })
    .limit(300);
  const rows = (data ?? []) as Inquiry[];
  const { data: reportData } = await supabase
    .from("problem_reports")
    .select("id, created_at, name, contact, message, page, handled")
    .order("handled")
    .order("created_at", { ascending: false })
    .limit(300);
  const reports = (reportData ?? []) as Report[];

  const { data: mailData } = await supabase
    .from("mailing_list")
    .select("id, created_at, name, email")
    .order("created_at", { ascending: false })
    .limit(1000);
  const subscribers = (mailData ?? []) as { id: string; created_at: string; name: string; email: string }[];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl text-ink">נרשמות לדיוור במייל ({subscribers.length})</h1>
      {subscribers.length === 0 && <p className="text-ink-soft">עוד אין נרשמות.</p>}
      <ul className="space-y-2">
        {subscribers.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3 text-sm">
            <span className="font-bold text-ink">{m.name}</span>
            <a href={`mailto:${m.email}`} className="ltr text-accent">{m.email}</a>
            <span className="text-xs text-ink-soft">{formatDate(m.created_at)}</span>
          </li>
        ))}
      </ul>

      <h2 className="pt-6 text-2xl text-ink">פניות מעסקים</h2>
      {rows.length === 0 && <p className="text-ink-soft">עוד לא הגיעו פניות.</p>}
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className={`space-y-2 rounded-[var(--radius-card)] bg-surface p-5 ${r.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-ink">
                {r.business_name} <span className="font-normal text-ink-soft">· {r.contact_name}</span>
              </p>
              <span className="text-xs text-ink-soft">{formatDate(r.created_at)}</span>
            </div>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a href={`tel:${r.phone}`} className="ltr font-semibold text-accent">{r.phone}</a>
              <a href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "972")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
                וואטסאפ
              </a>
              {r.email && <a href={`mailto:${r.email}`} className="ltr text-accent">{r.email}</a>}
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener noreferrer nofollow" className="ltr text-accent">
                  {r.website}
                </a>
              )}
            </p>
            {r.message && <p className="whitespace-pre-line text-sm text-ink-soft">{r.message}</p>}
            <form action={setInquiryStatus} className="space-y-2">
              <input type="hidden" name="id" value={r.id} />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  name="status"
                  defaultValue={r.status}
                  aria-label="סטטוס הפנייה"
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button className="btn-secondary px-4 py-1.5 text-sm">שמירה</button>
              </div>
              <textarea
                name="note"
                defaultValue={r.admin_note ?? ""}
                maxLength={1000}
                rows={2}
                placeholder="הערה פנימית: איך נסגר, מה הבעיה, מה הצעד הבא"
                aria-label="הערה פנימית"
                className="w-full rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
            </form>
          </li>
        ))}
      </ul>

      <h2 className="pt-6 text-2xl text-ink">דיווחים על בעיות באתר</h2>
      {reports.length === 0 && <p className="text-ink-soft">עוד לא הגיעו דיווחים.</p>}
      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className={`space-y-2 rounded-[var(--radius-card)] bg-surface p-5 ${r.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-ink">
                {r.name || "ללא שם"} <span className="ltr font-normal text-ink-soft">· {r.contact}</span>
              </p>
              <span className="text-xs text-ink-soft">{formatDate(r.created_at)}</span>
            </div>
            <p className="whitespace-pre-line text-sm text-ink-soft">{r.message}</p>
            {r.page && <p className="ltr text-xs text-ink-soft">{r.page}</p>}
            <form action={setReportHandled}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="handled" value={String(!r.handled)} />
              <button className="btn-secondary px-4 py-1.5 text-sm">{r.handled ? "החזרה לטיפול" : "סימון כטופל"}</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}