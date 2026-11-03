import Link from "next/link";
import { ActionResult } from "@/components/admin/ActionResult";
import { StatTile } from "@/components/admin/StatTile";
import { formatDate } from "@/lib/format";
import {
  agorotToShekels,
  conversionStatusLabel,
  frequencyLabel,
  formatPoints,
} from "@/lib/rewards/format";
import type {
  AffiliateConversionRow,
  AuditLogRow,
  EarningRuleRow,
  PointsBalanceRow,
  RewardsStats,
} from "@/lib/rewards/types";
import { createClient } from "@/lib/supabase/server";
import { setConversionStatus, setProgramEnabled, setRuleActive } from "./actions";

type SearchParams = Promise<{ ok?: string; error?: string; q?: string }>;

interface MemberRow {
  id: string;
  display_name: string | null;
  email: string | null;
  city: string | null;
  created_at: string;
}

const auditLabels: Record<string, string> = {
  "points.adjust": "עדכון נקודות ידני",
  "points.reverse": "ביטול תנועה",
  "points.cancel_pending": "ביטול נקודות בהמתנה",
  "rule.set_active": "הפעלה/כיבוי של כלל",
  "program.set_enabled": "הפעלה/כיבוי של המועדון",
  "conversion.set_status": "עדכון סטטוס קנייה",
};

const section = "space-y-4 rounded-[var(--radius-card)] border border-line bg-paper p-5";
const th = "px-3 py-2 text-start text-xs font-semibold text-ink-soft";
const td = "px-3 py-2.5 text-sm";

export default async function AdminRewardsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const supabase = await createClient();

  let membersQuery = supabase
    .from("profiles")
    .select("id, display_name, email, city, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (q) {
    const pattern = `%${q.replace(/[%_,()]/g, "")}%`;
    membersQuery = membersQuery.or(`display_name.ilike.${pattern},email.ilike.${pattern}`);
  }

  const [stats, rules, members, conversions, audit] = await Promise.all([
    supabase.rpc("admin_rewards_stats"),
    supabase.from("earning_rules").select("*").order("kind").order("key"),
    membersQuery,
    supabase
      .from("affiliate_conversions")
      .select(
        "id, network, external_id, user_id, business_id, commission_agorot, order_amount_agorot, status, occurred_at",
      )
      .eq("status", "pending")
      .order("occurred_at")
      .limit(50),
    supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const s = stats.data as RewardsStats | null;
  const memberRows = (members.data ?? []) as MemberRow[];
  const balances = new Map<string, PointsBalanceRow>();
  if (memberRows.length > 0) {
    const { data } = await supabase
      .from("points_balances")
      .select("*")
      .in(
        "user_id",
        memberRows.map((m) => m.id),
      );
    for (const b of (data ?? []) as PointsBalanceRow[]) balances.set(b.user_id, b);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">מועדון ונקודות</h1>
          <p className="text-sm text-ink-soft">כל פעולה כאן נבדקת בשרת ונרשמת ביומן הפעולות.</p>
        </div>
        {s && (
          <form action={setProgramEnabled} className="flex items-center gap-3">
            <input type="hidden" name="enabled" value={String(!s.program_enabled)} />
            <input type="hidden" name="return_to" value="/admin/rewards" />
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                s.program_enabled ? "bg-sage-soft text-sage" : "bg-gold-soft text-gold"
              }`}
            >
              {s.program_enabled ? "המועדון פעיל" : "המועדון כבוי — לא נצברות נקודות"}
            </span>
            <button
              type="submit"
              className="rounded-full border border-plum px-4 py-2 text-sm font-semibold text-plum hover:bg-plum-soft"
            >
              {s.program_enabled ? "כיבוי" : "הפעלה"}
            </button>
          </form>
        )}
      </header>

      <ActionResult ok={params.ok} error={params.error} />

      {s && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="חברות במועדון" value={s.members} />
          <StatTile label="חברות עם נקודות" value={s.members_with_points} />
          <StatTile label="נקודות זמינות (סה״כ)" value={s.points_available} />
          <StatTile label="נצברו ב־30 יום" value={s.points_earned_30d} />
        </dl>
      )}

      {/* Rules */}
      <section className={section} aria-labelledby="rules">
        <h2 id="rules" className="text-lg font-bold text-ink">
          כללי צבירה
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>כלל</th>
                <th className={th}>נקודות</th>
                <th className={th}>תדירות</th>
                <th className={th}>מקסימום</th>
                <th className={th}>סטטוס</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((rules.data ?? []) as EarningRuleRow[]).map((r) => (
                <tr key={r.id}>
                  <td className={td}>
                    <p className="font-semibold text-ink">{r.title}</p>
                    <p className="ltr text-start text-xs text-ink-soft">{r.key}</p>
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {r.kind === "activity"
                      ? r.points
                      : `${r.points_per_commission_shekel} לכל ₪1 עמלה`}
                  </td>
                  <td className={td}>
                    {r.kind === "activity" ? frequencyLabel[r.frequency] : "לכל קנייה"}
                  </td>
                  <td className={`${td} tabular-nums`}>{r.max_per_user ?? "—"}</td>
                  <td className={td}>
                    {!r.is_implemented ? (
                      <span className="text-xs text-ink-soft">בפיתוח</span>
                    ) : r.is_active ? (
                      <span className="text-xs font-bold text-sage">פעיל</span>
                    ) : (
                      <span className="text-xs font-bold text-gold">כבוי</span>
                    )}
                  </td>
                  <td className={`${td} text-end`}>
                    {r.is_implemented && (
                      <form action={setRuleActive}>
                        <input type="hidden" name="rule_id" value={r.id} />
                        <input type="hidden" name="active" value={String(!r.is_active)} />
                        <input type="hidden" name="return_to" value="/admin/rewards" />
                        <button
                          type="submit"
                          className="text-sm font-semibold text-plum hover:underline"
                        >
                          {r.is_active ? "כיבוי" : "הפעלה"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-soft">
          כללים &quot;בפיתוח&quot; מוכנים בהגדרות, אבל אי אפשר להפעיל אותם עד שיהיה להם אימות בצד
          השרת.
        </p>
      </section>

      {/* Members */}
      <section className={section} aria-labelledby="members">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="members" className="text-lg font-bold text-ink">
            חברות ויתרות
          </h2>
          <form className="flex gap-2" role="search">
            <label htmlFor="q" className="sr-only">
              חיפוש חברה
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="שם או אימייל"
              className="rounded-full border border-line bg-cream px-4 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-white"
            >
              חיפוש
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>חברה</th>
                <th className={th}>הצטרפה</th>
                <th className={th}>זמינות</th>
                <th className={th}>בהמתנה</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {memberRows.map((m) => {
                const b = balances.get(m.id);
                return (
                  <tr key={m.id}>
                    <td className={td}>
                      <p className="font-semibold text-ink">{m.display_name ?? "ללא שם"}</p>
                      <p className="ltr text-start text-xs text-ink-soft">{m.email}</p>
                    </td>
                    <td className={`${td} text-ink-soft`}>{formatDate(m.created_at)}</td>
                    <td className={`${td} font-bold tabular-nums`}>{b?.available ?? 0}</td>
                    <td className={`${td} tabular-nums text-ink-soft`}>{b?.pending ?? 0}</td>
                    <td className={`${td} text-end`}>
                      <Link
                        href={`/admin/rewards/members/${m.id}`}
                        className="text-sm font-semibold text-plum hover:underline"
                      >
                        פרטים ←
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {memberRows.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-soft">לא נמצאו חברות.</p>
          )}
        </div>
      </section>

      {/* Pending purchases */}
      <section className={section} aria-labelledby="pending">
        <h2 id="pending" className="text-lg font-bold text-ink">
          קניות ממתינות לאימות
        </h2>
        {(conversions.data ?? []).length === 0 ? (
          <p className="text-sm text-ink-soft">
            אין קניות ממתינות. קניות יופיעו כאן אחרי שנחבר רשת שותפים שמדווחת על רכישות.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {((conversions.data ?? []) as AffiliateConversionRow[]).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-ink">
                    <span className="ltr">{c.network}</span> · עמלה{" "}
                    {agorotToShekels(c.commission_agorot)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {formatDate(c.occurred_at)} · {conversionStatusLabel[c.status]}
                  </p>
                </div>
                <form action={setConversionStatus} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="conversion_id" value={c.id} />
                  <input type="hidden" name="return_to" value="/admin/rewards" />
                  <label htmlFor={`reason-${c.id}`} className="sr-only">
                    סיבה
                  </label>
                  <input
                    id={`reason-${c.id}`}
                    name="reason"
                    required
                    minLength={3}
                    placeholder="סיבה"
                    className="rounded-full border border-line px-3 py-1.5 text-sm"
                  />
                  <button
                    name="status"
                    value="approved"
                    className="rounded-full bg-sage px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    אישור
                  </button>
                  <button
                    name="status"
                    value="cancelled"
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink"
                  >
                    ביטול
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Audit log */}
      <section className={section} aria-labelledby="audit">
        <h2 id="audit" className="text-lg font-bold text-ink">
          יומן פעולות
        </h2>
        {(audit.data ?? []).length === 0 ? (
          <p className="text-sm text-ink-soft">עוד לא בוצעו פעולות ניהול.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {((audit.data ?? []) as AuditLogRow[]).map((a) => {
              const amount = a.details["amount"];
              const reason = a.details["reason"];
              return (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-ink">
                    {auditLabels[a.action] ?? a.action}
                    {typeof amount === "number" && (
                      <span className="ms-2 font-semibold tabular-nums">
                        {formatPoints(amount)}
                      </span>
                    )}
                    {typeof reason === "string" && (
                      <span className="ms-2 text-ink-soft">— {reason}</span>
                    )}
                  </span>
                  <span className="text-xs text-ink-soft">{formatDate(a.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
