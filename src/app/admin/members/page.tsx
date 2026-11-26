import Link from "next/link";
import { RowDelete } from "@/components/admin/RowDelete";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { deleteMember } from "./actions";

type Member = {
  id: string;
  display_name: string | null;
  email: string | null;
  community_channel: string | null;
  marketing_consent: boolean;
  role: string;
  created_at: string;
};

const labels: Record<string, string> = { whatsapp: "וואטסאפ", email: "אימייל" };
const RESULTS: Record<string, string> = {
  deleted: "החשבון נמחק. אפשר להירשם שוב עם אותו מייל.",
  history: "אי אפשר למחוק: לחשבון הזה יש היסטוריה במערכת (נקודות, פעולות ניהול או בית עסק).",
  admin: "אי אפשר למחוק מנהלת או את החשבון שלך.",
  failed: "המחיקה נכשלה. נסי שוב, ואם זה חוזר, שלחי לי את ההודעה.",
};
const filters = [
  { value: "", label: "כולן" },
  { value: "whatsapp", label: "וואטסאפ" },
  { value: "email", label: "אימייל" },
];

export default async function Members({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; result?: string }>;
}) {
  await requireAdmin();
  const { channel = "", result = "" } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email, community_channel, marketing_consent, role, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  const all = (data ?? []) as Member[];
  const count = (c: string) => all.filter((m) => m.community_channel === c).length;
  const shown = channel in labels ? all.filter((m) => m.community_channel === channel) : all;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">חברות</h1>
        <a href="/admin/members/export" className="btn-secondary px-5 py-2 text-sm">
          הורדה כקובץ (CSV)
        </a>
      </div>
      {RESULTS[result] && (
        <p role="status" className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
          {RESULTS[result]}
        </p>
      )}
      <p className="text-sm text-ink-soft">
        לשליחת דיוור שיווקי במייל, להשתמש רק במי שמסומן &quot;אישרה דיוור: כן&quot;.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["סך הכול", all.length],
          ["בוואטסאפ", count("whatsapp")],
          ["באימייל", count("email")],
        ].map(([label, n]) => (
          <div key={label} className="rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)]">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="text-3xl font-bold text-ink">{n}</p>
          </div>
        ))}
      </div>

      <nav className="flex gap-2" aria-label="סינון לפי ערוץ">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/members?channel=${f.value}` : "/admin/members"}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              channel === f.value
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-ink hover:border-accent"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-6 text-ink-soft shadow-[var(--shadow-card)]">
          עוד אין חברות רשומות.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full text-start text-sm">
            <thead className="bg-raised text-ink-soft">
              <tr>
                <th className="p-3 text-start font-semibold">שם</th>
                <th className="p-3 text-start font-semibold">אימייל</th>
                <th className="p-3 text-start font-semibold">ערוץ</th>
                <th className="p-3 text-start font-semibold">אישרה דיוור</th>
                <th className="p-3 text-start font-semibold">הצטרפה</th>
                <th className="p-3 text-start font-semibold">
                  <span className="sr-only">מחיקה</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((m) => (
                <tr key={m.id}>
                  <td className="p-3 font-semibold text-ink">{m.display_name ?? "—"}</td>
                  <td className="ltr p-3 text-ink-soft">{m.email}</td>
                  <td className="p-3">{labels[m.community_channel ?? ""] ?? "לא נבחר"}</td>
                  <td className="p-3">{m.marketing_consent ? "כן" : "לא"}</td>
                  <td className="p-3 text-ink-soft">{m.created_at.slice(0, 10)}</td>
                  <td className="p-3">
                    {m.role === "admin" ? null : (
                      <RowDelete
                        action={deleteMember}
                        id={m.id}
                        name={m.display_name ?? m.email ?? "החברה"}
                        warning="החשבון יימחק וכל הנתונים שלה באתר יימחקו. היא תוכל להירשם שוב עם אותו מייל. אי אפשר לבטל."
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
