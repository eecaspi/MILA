import { requireAdmin } from "@/lib/auth/session";
import { toCsv } from "@/lib/admin/csv";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const channelLabel: Record<string, string> = { whatsapp: "וואטסאפ", email: "אימייל" };

/** Members list as a CSV file, for importing into a mailing tool. Admins only. */
export async function GET(): Promise<Response> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, email, community_channel, created_at")
    .order("created_at", { ascending: false });

  const rows: unknown[][] = [["שם", "אימייל", "ערוץ", "תאריך הצטרפות"]];
  for (const m of data ?? []) {
    rows.push([
      m.display_name,
      m.email,
      channelLabel[m.community_channel as string] ?? "",
      String(m.created_at ?? "").slice(0, 10),
    ]);
  }
  return new Response(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="liky-members.csv"',
      "cache-control": "no-store",
    },
  });
}
