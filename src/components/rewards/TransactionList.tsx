import { formatDate } from "@/lib/format";
import { describeTransaction, formatPoints, txStatusLabel } from "@/lib/rewards/format";
import type { PointsTransactionRow } from "@/lib/rewards/types";

export function TransactionList({
  transactions,
  empty = "עוד אין פעילות בנקודות.",
  renderAction,
}: {
  transactions: PointsTransactionRow[];
  empty?: string;
  renderAction?: (tx: PointsTransactionRow) => React.ReactNode;
}) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-soft">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{describeTransaction(tx)}</p>
            <p className="text-xs text-ink-soft">
              {formatDate(tx.created_at)}
              {tx.status !== "confirmed" && <> · {txStatusLabel[tx.status]}</>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={[
                "font-bold tabular-nums",
                tx.status === "cancelled"
                  ? "text-ink-soft line-through"
                  : tx.amount > 0
                    ? "text-sage"
                    : "text-ink",
                tx.status === "pending" ? "opacity-70" : "",
              ].join(" ")}
            >
              {formatPoints(tx.amount)}
            </span>
            {renderAction?.(tx)}
          </div>
        </li>
      ))}
    </ul>
  );
}
