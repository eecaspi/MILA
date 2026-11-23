import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContractText } from "@/components/contracts/ContractText";
import { PrintButton } from "@/components/contracts/PrintButton";
import { SignForm } from "@/components/contracts/SignForm";
import { siteConfig } from "@/config/site";
import {
  FIELD_KEYS,
  FIELD_LABELS,
  parseFields,
  parseTerms,
} from "@/lib/contracts/template";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "הסכם שיתוף פעולה עם ליקי",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_business_contract", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) notFound();
  const terms = parseTerms(row.terms);
  if (!terms) notFound();
  const signed = row.status === "signed";
  const fields = signed ? parseFields(row.signed_fields) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8" dir="rtl">
      <header className="space-y-1">
        <p className="eyebrow">{siteConfig.brand.name}</p>
        <h1 className="text-2xl text-ink sm:text-3xl">הסכם שיתוף פעולה: ליקי ו{row.label}</h1>
        <p className="text-sm text-ink-soft">
          {signed ? "ההסכם נחתם. אפשר להדפיס או לשמור עותק." : "נא לקרוא את ההסכם, למלא את הפרטים ולחתום בסוף העמוד."}
        </p>
      </header>

      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        <ContractText terms={terms} />
        <section className="mt-6 border-t border-line pt-4">
          <h2 className="text-lg font-bold text-ink">נספח א&apos;: שיעור העמלה</h2>
          <p className="mt-2 text-ink">שיעור העמלה לליקי: {terms.commissionPercent}% מערך מכירה מיוחסת.</p>
        </section>
      </div>

      {signed && fields ? (
        <div className="space-y-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
          <h2 className="text-lg font-bold text-ink">נספח א&apos;: פרטי העסק וההטבה</h2>
          <dl className="space-y-2 text-sm">
            {FIELD_KEYS.map((key) => (
              <div key={key} className="grid gap-1 sm:grid-cols-[14rem_1fr]">
                <dt className="font-semibold text-ink">{FIELD_LABELS[key]}</dt>
                <dd className="text-ink-soft">{fields[key] || "-"}</dd>
              </div>
            ))}
          </dl>
          <h2 className="pt-2 text-lg font-bold text-ink">חתימה</h2>
          <p className="text-sm text-ink">
            נחתם על ידי {row.signer_name}
            {row.signer_role ? `, ${row.signer_role}` : ""}, ב-
            {row.signed_at
              ? new Date(row.signed_at).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
              : ""}
            .
          </p>
          <p className="break-all text-xs text-ink-soft" dir="ltr">
            Version {row.template_version} · {row.content_hash}
          </p>
          <PrintButton />
        </div>
      ) : (
        <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
          <SignForm token={token} defaultName={row.label} />
        </div>
      )}
    </main>
  );
}
