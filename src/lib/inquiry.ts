export interface InquiryInput {
  business: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  message: string;
}

export type InquiryError = "missing" | "phone" | "email" | "website";

/** Cleans and checks a business inquiry. Returns the clean values or the first problem found. */
export function parseInquiry(raw: Record<string, unknown>): { ok: true; value: InquiryInput } | { ok: false; error: InquiryError } {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const value: InquiryInput = {
    business: s(raw.business, 120),
    name: s(raw.name, 80),
    phone: s(raw.phone, 30),
    email: s(raw.email, 120),
    website: s(raw.website, 200),
    message: s(raw.message, 1000),
  };
  if (!value.business || !value.name || !value.phone) return { ok: false, error: "missing" };
  if (value.phone.replace(/\D/g, "").length < 7 || !/^[\d\s+\-()]+$/.test(value.phone)) return { ok: false, error: "phone" };
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return { ok: false, error: "email" };
  if (value.website && !/^https?:\/\/\S+$/i.test(value.website)) return { ok: false, error: "website" };
  return { ok: true, value };
}
