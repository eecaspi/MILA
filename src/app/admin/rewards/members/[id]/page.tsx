import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionResult } from "@/components/admin/ActionResult";
import { PointsSummary } from "@/components/rewards/PointsSummary";
import { TransactionList } from "@/components/rewards/TransactionList";
import { formatDate } from "@/lib/format";
import { TX_COLUMNS } from "@/lib/rewards/queries";
import {
  EMPTY_BALANCE,
  type PointsBalanceRow,
  type PointsTransactionRow,
} from "@/lib/rewards/types";
import { createClient } from "@/lib/supabase/server";
import { adjustPoints, reverseTransaction } from "../../actions";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ok?: string; error?: string }>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminMemberPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const result = await searchParams;
  const supabase = await createClient();

  const [profile, balance, txs, program] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, email, city, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("points_balances").select("*").eq("user_id", id).maybeSingle(),
    supabase
      .from("points_transactions")
      .select(TX_COLUMNS)
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("rewards_program").select("is_enabled").maybeSingle(),
  ]);
  if (!profile.data) notFound();

  const member = profile.data as {
    id: string;
    display_name: string | null;
    email: string | null;
    city: string | null;
    created_at: string;
  };
  const transactions = (txs.data ?? []) as PointsTransactionRow[];
  const reversedIds = new Set(transactions.map((t) => t.reverses_transaction_id).filter(Boolean));
  const returnTo = `/admin/rewards/members/${member.id}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/rewards" className="text-sm font-semibold text-plum hover:underline">
        → חזרה לרשימה
      </Link>
      <header>
        <h1 className="text-2xl font-extrabold text-ink">{member.display_name ?? "ללא שם"}</h1>
        <p className="text-sm text-ink-soft">
          <span className="ltr">{member.email}</span>
          {member.city ? ` · ${member.city}` : ""} · הצטרפה {formatDate(member.created_at)}
        </p>
      </header>

      <ActionResult ok={result.ok} error={result.error} />

      <PointsSummary
        balance={(balance.data as PointsBalanceRow | null) ?? EMPTY_BALANCE}
        programEnabled={Boolean((program.data as { is_enabled?: boolean } | null)?.is_enabled)}
      />

      <section className="space-y-4 rounded-[var(--radius-card)] border border-line bg-paper p-5">
        <h2 className="text-lg font-bold text-ink">עדכון נקודות ידני</h2>
        <form
          action={adjustPoints}
          className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
        >
          <input type="hidden" name="user_id" value={member.id} />
          <input type="hidden" name="request_id" value={randomUUID()} />
          <input type="hidden" name="return_to" value={returnTo} />
          <div className="flex flex-col gap-1">
            <label htmlFor="amount" className="text-sm font-semibold text-ink">
              נקודות
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step={1}
              required
              dir="ltr"
              placeholder="50 או -50"
              className="rounded-xl border border-line px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reason" className="text-sm font-semibold text-ink">
              סיבה (חובה, נשמרת ביומן)
            </label>
            <input
              id="reason"
              name="reason"
              required
              minLength={3}
              maxLength={200}
              className="rounded-xl border border-line px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-plum px-5 py-2.5 font-semibold text-white"
          >
            עדכון
          </button>
        </form>
        <p className="text-xs text-ink-soft">
          מספר שלילי מוריד נקודות. אי אפשר להוריד יותר מהיתרה הזמינה.
        </p>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-paper p-5">
        <h2 className="text-lg font-bold text-ink">היסטוריית תנועות</h2>
        <TransactionList
          transactions={transactions}
          renderAction={(tx) =>
            tx.type !== "reversal" && tx.status !== "cancelled" && !reversedIds.has(tx.id) ? (
              <details className="relative">
                <summary className="cursor-pointer list-none text-xs font-semibold text-plum hover:underline [&::-webkit-details-marker]:hidden">
                  {tx.status === "pending" ? "ביטול" : "ביטול תנועה"}
                </summary>
                <form
                  action={reverseTransaction}
                  className="absolute end-0 z-10 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-line bg-paper p-3 shadow-lg"
                >
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <label htmlFor={`rev-${tx.id}`} className="text-xs font-semibold text-ink">
                    סיבת הביטול
                  </label>
                  <input
                    id={`rev-${tx.id}`}
                    name="reason"
                    required
                    minLength={3}
                    className="rounded-lg border border-line px-2 py-1.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-plum px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    אישור ביטול
                  </button>
                </form>
              </details>
            ) : null
          }
        />
      </section>
    </div>
  );
}
