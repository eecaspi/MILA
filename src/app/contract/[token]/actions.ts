"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  CONTRACT_VERSION,
  contractPlainText,
  FIELD_KEYS,
  parseTerms,
  readFields,
} from "@/lib/contracts/template";
import { createClient } from "@/lib/supabase/server";

export type SignState = { error?: string };

export async function signContract(token: string, _prev: SignState, formData: FormData): Promise<SignState> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: "הקישור לא תקין." };
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_business_contract", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { error: "ההסכם לא נמצא. בקשי קישור חדש מליקי." };
  if (row.status !== "sent") return { error: "ההסכם כבר נחתם." };
  const terms = parseTerms(row.terms);
  if (!terms) return { error: "ההסכם לא תקין. פני אל ליקי." };

  const get = (key: string) => String(formData.get(key) ?? "");
  const fields = readFields(get);
  for (const key of FIELD_KEYS) {
    if (key !== "restrictions" && !fields[key]) return { error: "צריך למלא את כל השדות (מלבד מוצרים והגבלות)." };
  }
  const signerName = get("signerName").trim().slice(0, 80);
  const signerRole = get("signerRole").trim().slice(0, 80);
  if (signerName.length < 2) return { error: "צריך שם מלא של החותמת." };
  if (get("agree") !== "yes") return { error: "צריך לאשר שקראת ומסכימה." };
  if (get("authority") !== "yes") return { error: "צריך לאשר שאת מוסמכת לחתום בשם העסק." };

  const rawSig = get("signature");
  const signature =
    /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(rawSig) && rawSig.length < 200_000 ? rawSig : "";

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ?? "";
  const ua = h.get("user-agent") ?? "";
  const hash = createHash("sha256")
    .update(`${CONTRACT_VERSION}\n${contractPlainText(terms, fields)}\n${signerName}\n${signerRole}\n${signature}`)
    .digest("hex");

  const { data: ok, error } = await supabase.rpc("sign_business_contract", {
    p_token: token,
    p_signer_name: signerName,
    p_signer_role: signerRole,
    p_fields: signature ? { ...fields, _signature: signature } : fields,
    p_ip: ip,
    p_user_agent: ua,
    p_hash: hash,
  });
  if (error) return { error: "החתימה נכשלה. נסי שוב בעוד רגע." };
  if (!ok) return { error: "ההסכם כבר נחתם." };
  revalidatePath(`/contract/${token}`);
  return {};
}
