"use client";

import { useActionState } from "react";
import { createContract, type ContractCreateResult } from "@/app/admin/contract-actions";

export function ContractCreateForm() {
  const [state, action, pending] = useActionState<ContractCreateResult, FormData>(createContract, {});
  const input = "w-full rounded-xl border border-line bg-surface px-3 py-2";
  const lab = "mb-1 block text-sm font-semibold text-ink";
  return (
    <form action={action} className="max-w-xl space-y-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <label className="block">
        <span className={lab}>שם העסק</span>
        <input name="label" required maxLength={120} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={lab}>עמלה לליקי (%)</span>
          <input name="commissionPercent" type="number" min={1} max={100} step="0.5" required dir="ltr" className={input} />
        </label>
        <label className="block">
          <span className={lab}>העמלה</span>
          <select name="vat" className={input}>
            <option value="without">לא כוללת מע״מ</option>
            <option value="with">כוללת מע״מ</option>
          </select>
        </label>
        <label className="block">
          <span className={lab}>ימי תשלום מקבלת הדוח</span>
          <input name="paymentDays" type="number" min={0} max={180} required dir="ltr" className={input} />
        </label>
        <label className="block">
          <span className={lab}>דוח מכירות</span>
          <select name="reportPeriod" className={input}>
            <option value="monthly">חודשי</option>
            <option value="biweekly">דו־שבועי</option>
          </select>
        </label>
        <label className="block">
          <span className={lab}>ימי הודעה מראש (שינוי / הפסקה)</span>
          <input name="noticeDays" type="number" min={0} max={180} required dir="ltr" className={input} />
        </label>
        <label className="block">
          <span className={lab}>עיר בית המשפט המוסמך</span>
          <input name="courtCity" required maxLength={60} className={input} />
        </label>
      </div>
      <label className="block">
        <span className={lab}>תקופת ההסכם (ריק = ללא הגבלה)</span>
        <input name="term" maxLength={200} placeholder="למשל: 31.12.2027" className={input} />
      </label>
      <label className="block">
        <span className={lab}>רמת חשיפה שסוכמה (אפשר להשאיר ריק)</span>
        <input name="exposure" maxLength={300} className={input} />
      </label>
      {state.error && <p role="alert" className="text-sm font-semibold text-accent">{state.error}</p>}
      {state.ok && <p className="text-sm font-semibold text-ink">נוצר. הקישור מופיע ברשימה למטה.</p>}
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "יוצרת..." : "יצירת קישור להסכם"}
      </button>
    </form>
  );
}
