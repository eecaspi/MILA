import { Alert } from "@/components/ui/Alert";
import { inputClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { setRole } from "../content-actions";

const errors: Record<string, string> = {
  not_found: "לא מצאנו חברה רשומה עם המייל הזה. היא צריכה קודם להירשם לאתר.",
  last_admin: "אי אפשר להסיר את המנהלת האחרונה.",
  failed: "הפעולה נכשלה. נסי שוב.",
};

export default async function Team({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [{ ok, error }, session] = await Promise.all([searchParams, requireAdmin()]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .eq("role", "admin")
    .order("created_at");
  const admins = (data ?? []) as {
    id: string;
    email: string | null;
    display_name: string | null;
  }[];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl text-ink">צוות הניהול</h1>
      {ok && <Alert tone="success">ההרשאות עודכנו ונרשמו ביומן.</Alert>}
      {error && <Alert tone="error">{errors[error] ?? errors.failed}</Alert>}

      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
        {admins.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-ink">{a.display_name ?? "מנהלת"}</p>
              <p className="ltr text-sm text-ink-soft">{a.email}</p>
            </div>
            {a.id !== session.userId && a.email && (
              <form action={setRole}>
                <input type="hidden" name="email" value={a.email} />
                <input type="hidden" name="role" value="member" />
                <button className="text-sm font-semibold text-danger hover:underline">
                  הסרת הרשאת ניהול
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form
        action={setRole}
        className="space-y-3 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]"
      >
        <h2 className="text-base text-ink">הוספת מנהלת</h2>
        <p className="text-sm text-ink-soft">
          היא צריכה קודם להירשם לאתר עם המייל שלה. אחר כך כותבים כאן את המייל.
        </p>
        <input type="hidden" name="role" value="admin" />
        <div className="flex flex-wrap gap-2">
          <input
            name="email"
            type="email"
            dir="ltr"
            required
            placeholder="name@example.com"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="btn-primary">הוספה</button>
        </div>
      </form>
    </div>
  );
}
