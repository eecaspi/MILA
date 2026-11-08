import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function Subscribers() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("mailing_list")
    .select("id, created_at, name, email")
    .order("created_at", { ascending: false })
    .limit(1000);
  const subscribers = (data ?? []) as { id: string; created_at: string; name: string; email: string }[];

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
    </div>
  );
}
