import type { Metadata } from "next";
import Image from "next/image";
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
  const rawSignature = signed ? (row.signed_fields as Record<string, unknown> | null)?._signature : null;
  const signatureImage =
    typeof rawSignature === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(rawSignature)
      ? rawSignature
      : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12" dir="rtl">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-b from-accent-soft to-surface px-5 py-8 text-center shadow-[var(--shadow-card)] sm:px-10 sm:py-10">
        <Image
          src="/brand/liky-logo.png"
          alt={siteConfig.brand.name}
          width={160}
          height={128}
          className="mx-auto h-14 w-auto"
        />
        <p className="eyebrow mt-4">הסכם שיתוף פעולה</p>
        <h1 className="mt-1 text-2xl text-ink sm:text-3xl">ליקי ו{row.label}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          {signed
            ? "ההסכם נחתם. אפשר להדפיס או לשמור עותק."
            : "שמחות שאתם מצטרפים. כמה דקות של קריאה ומילוי, וההטבה שלכם עולה."}
        </p>
        {!signed && (
          <ol className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2 text-xs font-semibold text-ink">
            {["קוראים את ההסכם", "ממלאים את הפרטים", "חותמים"].map((t, i) => (
              <li key={t} className="flex flex-col items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        )}
      </header>

      <div className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-9">
        <ContractText terms={terms} />
        <section className="mt-8 rounded-2xl bg-accent-soft p-5">
          <h2 className="text-base font-bold text-ink">נספח א&apos;: שיעור העמלה</h2>
          <p className="mt-1 text-2xl font-extrabold text-accent">{terms.commissionPercent}%</p>
          <p className="text-sm text-ink">מערך מכירה מיוחסת, לפי האמור בהסכם.</p>
        </section>
      </div>

      {signed && fields ? (
        <div className="space-y-4 rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-9">
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
          {signatureImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={signatureImage} alt="החתימה" className="h-24 w-auto rounded border border-line bg-white" />
          )}
          <p className="break-all text-xs text-ink-soft" dir="ltr">
            Version {row.template_version} · {row.content_hash}
          </p>
          <PrintButton />
        </div>
      ) : (
        <div className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-9">
          <SignForm token={token} defaultName={row.label} />
        </div>
      )}
    </main>
  );
}
