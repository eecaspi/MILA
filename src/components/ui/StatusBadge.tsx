import type { VerificationStatus } from "@/lib/types";

const styles: Record<VerificationStatus, { label: string; className: string }> = {
  demo: { label: "תוכן להדגמה", className: "bg-accent-soft text-accent border-accent/30" },
  listed: { label: "ממידע פומבי", className: "bg-raised text-ink-soft border-line" },
  verified: { label: "הצעה מאומתת ✓", className: "bg-sage-soft text-sage border-sage/30" },
};

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const { label, className } = styles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
