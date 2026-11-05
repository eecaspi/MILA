import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setInquiryHandled } from "./actions";

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
};

export default async function Inquiries() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_inquiries")
    .select("id, created_at, business_name, contact_name, phone, email, website, message, handled")
    .order("handled")
    .order("created_at", { ascending: false })
    .limit(300);
  const rows = (data ?? []) as Inquiry[];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl text-ink">פניות מעסקים</h1>
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
            <form action={setInquiryHandled}>
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
