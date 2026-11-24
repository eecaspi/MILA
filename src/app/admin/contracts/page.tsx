import { headers } from "next/headers";
import { cancelContract } from "@/app/admin/contract-actions";
import { ContractCreateForm } from "@/components/admin/ContractCreateForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "הסכמים" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { sent: "נשלח, ממתין לחתימה", signed: "נחתם", cancelled: "בוטל" };

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_contracts")
    .select("id, token, label, status, created_at, signed_at, signer_name, signer_role, terms")
    .order("created_at", { ascending: false });
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host") ?? ""}`;
  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-ink">הסכמים עם עסקים</h1>
      <p className="max-w-xl text-ink-soft">
        ממלאות כאן את התנאים של העסק ומקבלות קישור. שולחות אותו לעסק, והעסק קורא, ממלא את פרטיו וחותם בעצמו. החתימה נשמרת כאן עם שם, תאריך ושעה.
      </p>
      <ContractCreateForm />
      {error && <p className="text-sm font-semibold text-accent">לא ניתן לקרוא את הרשימה. ייתכן שהמיגרציה עוד לא הורצה.</p>}
      <ul className="space-y-3">
        {rows.map((c) => {
          const url = `${origin}/contract/${c.token}`;
          const terms = (c.terms ?? {}) as { commissionPercent?: number };
          return (
            <li key={c.id as string} className="max-w-xl space-y-2 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-bold text-ink">{c.label as string}</p>
                <span className="text-sm font-semibold text-accent">{STATUS[c.status as string] ?? c.status}</span>
              </div>
              <p className="text-xs text-ink-soft">
                עמלה {terms.commissionPercent}%
                {c.signed_at
                  ? ` · נחתם ע״י ${c.signer_name}${c.signer_role ? `, ${c.signer_role}` : ""} ב-${new Date(c.signed_at as string).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}`
                  : ""}
              </p>
              {c.status !== "cancelled" && (
                <input readOnly value={url} dir="ltr" aria-label="קישור להסכם" className="w-full rounded-lg border border-line bg-raised px-2 py-1.5 text-xs" />
              )}
              <div className="flex gap-3 text-sm">
                {c.status !== "cancelled" && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
                    {c.status === "signed" ? "צפייה בהסכם החתום" : "תצוגה כמו שהעסק רואה"}
                  </a>
                )}
                {c.status === "sent" && (
                  <form action={cancelContract}>
                    <input type="hidden" name="id" value={c.id as string} />
                    <button type="submit" className="text-ink-soft underline">ביטול הקישור</button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
