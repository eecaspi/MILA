"use client";

import { useActionState } from "react";
import { saveBusiness, type FormState } from "@/app/admin/content-actions";
import { Alert } from "@/components/ui/Alert";
import { categories } from "@/data/categories";
import { Check, Field, ImageField, SubmitButton, inputClass } from "./FormBits";

export interface BusinessFormValues {
  id?: string;
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  area: string;
  city: string | null;
  website: string | null;
  phone: string | null;
  tags: string[];
  status: string;
  is_published: boolean;
  sort_order: number;
  logo_url: string | null;
  cover_url: string | null;
}

export function BusinessForm({ business }: { business?: BusinessFormValues }) {
  const [state, action] = useActionState<FormState, FormData>(saveBusiness, {});
  const e = state.errors ?? {};
  const b = business;

  return (
    <form action={action} className="space-y-6" noValidate>
      {b?.id && <input type="hidden" name="id" value={b.id} />}
      {state.message && <Alert tone="error">{state.message}</Alert>}
      {Object.keys(e).length > 0 && <Alert tone="error">יש שדות שצריך לתקן (מסומנים למטה).</Alert>}

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <Field label="שם העסק *" name="name" error={e.name}>
          <input id="name" name="name" defaultValue={b?.name} required className={inputClass} />
        </Field>
        <Field label="קטגוריה *" name="category_slug" error={e.category_slug}>
          <select
            id="category_slug"
            name="category_slug"
            defaultValue={b?.category_slug ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              בחרי קטגוריה
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="תיאור קצר *"
            name="short_description"
            error={e.short_description}
            hint="משפט אחד שמופיע בכרטיס העסק"
          >
            <input
              id="short_description"
              name="short_description"
              defaultValue={b?.short_description}
              maxLength={200}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="תיאור מלא" name="description" error={e.description}>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={b?.description}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="אזור" name="area" hint="למשל: בני ברק, ירושלים, משלוחים לכל הארץ">
          <input id="area" name="area" defaultValue={b?.area} className={inputClass} />
        </Field>
        <Field label="עיר" name="city">
          <input id="city" name="city" defaultValue={b?.city ?? ""} className={inputClass} />
        </Field>
        <Field label="אתר" name="website" error={e.website}>
          <input
            id="website"
            name="website"
            dir="ltr"
            defaultValue={b?.website ?? ""}
            placeholder="example.co.il"
            className={inputClass}
          />
        </Field>
        <Field label="טלפון" name="phone" error={e.phone}>
          <input
            id="phone"
            name="phone"
            dir="ltr"
            defaultValue={b?.phone ?? ""}
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="תגיות" name="tags" hint="מופרדות בפסיק, עד 8">
            <input id="tags" name="tags" defaultValue={b?.tags.join(", ")} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <ImageField
          label="לוגו"
          name="logo"
          current={b?.logo_url}
          removeName="remove_logo"
          error={e.logo}
        />
        <ImageField
          label="תמונת רקע"
          name="cover"
          current={b?.cover_url}
          removeName="remove_cover"
          error={e.cover}
        />
      </section>

      <section className="grid gap-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <Field label="סטטוס" name="status" hint="מאומת = בדקנו מול העסק">
          <select
            id="status"
            name="status"
            defaultValue={b?.status === "verified" ? "verified" : "listed"}
            className={inputClass}
          >
            <option value="listed">ברשימה</option>
            <option value="verified">מאומת</option>
          </select>
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-1 sm:col-span-2">
          <Check
            name="pin_first"
            label="להציג ראשון ברשימת העסקים"
            defaultChecked={(b?.sort_order ?? 0) < 0}
          />
          <Check name="is_published" label="מפורסם באתר" defaultChecked={b?.is_published} />
        </div>
      </section>

      <SubmitButton>{b?.id ? "שמירת שינויים" : "הוספת העסק"}</SubmitButton>
    </form>
  );
}
