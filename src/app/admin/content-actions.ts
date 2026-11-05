"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/data/mappers";
import {
  MAX_GALLERY,
  imageFile,
  imageFiles,
  keptGallery,
  parseBusinessForm,
  parseOfferForm,
  uploadPath,
  type FieldErrors,
} from "@/lib/admin/validate";
import { createClient } from "@/lib/supabase/server";

/*
 * Back-office content actions. Server actions are public endpoints, so each one
 * checks admin rights again; row-level security checks them a third time, and
 * database triggers write every change to the audit log.
 */

export interface FormState {
  errors?: FieldErrors;
  message?: string;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

function refreshSite() {
  revalidateTag("content");
  revalidatePath("/", "layout");
}

function str(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function idFrom(fd: FormData): string | null {
  const id = str(fd, "id");
  return UUID.test(id) ? id : null;
}

/** Uploads an image to the public media bucket and returns its public URL. */
async function upload(
  supabase: Supabase,
  folder: "businesses" | "offers",
  id: string,
  file: File,
): Promise<string | null> {
  const path = uploadPath(folder, id, file);
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("media upload failed", error.message);
    return null;
  }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function dbMessage(message: string): string {
  if (message.includes("duplicate key")) return "כבר קיים פריט עם אותם פרטים.";
  if (message.includes("Demo offers")) return "אי אפשר לסמן הטבה כ'לדוגמה' על עסק אמיתי.";
  if (message.includes("violates check constraint")) return "חלק מהשדות לא תקינים. בדקי ונסי שוב.";
  return "השמירה נכשלה. נסי שוב בעוד רגע.";
}

// ---------------------------------------------------------------- businesses

export async function saveBusiness(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseBusinessForm(fd);
  const errors: FieldErrors = parsed.ok ? {} : { ...parsed.errors };
  const logo = imageFile(fd, "logo", errors);
  const cover = imageFile(fd, "cover", errors);
  const gallery = imageFiles(fd, "gallery", errors);
  if (!parsed.ok || Object.keys(errors).length) return { errors };

  const supabase = await createClient();
  let id = idFrom(fd);
  const values = parsed.values;

  if (id) {
    const { error } = await supabase.from("businesses").update(values).eq("id", id);
    if (error) return { message: dbMessage(error.message) };
  } else {
    const { data, error } = await supabase
      .from("businesses")
      .insert({ ...values, slug: slugify(values.name), is_real_business: true })
      .select("id")
      .single();
    if (error || !data) return { message: dbMessage(error?.message ?? "") };
    id = data.id as string;
  }

  const images: { logo_url?: string | null; cover_url?: string | null } = {};
  if (fd.get("remove_logo") === "on") images.logo_url = null;
  if (fd.get("remove_cover") === "on") images.cover_url = null;
  if (logo) images.logo_url = await upload(supabase, "businesses", `${id}-logo`, logo);
  if (cover) images.cover_url = await upload(supabase, "businesses", `${id}-cover`, cover);
  if (Object.keys(images).length) {
    await supabase.from("businesses").update(images).eq("id", id);
  }

  // Gallery: drop the photos marked for removal, then add new uploads (up to the limit).
  const { data: current } = await supabase
    .from("businesses")
    .select("gallery_urls")
    .eq("id", id)
    .maybeSingle();
  const before = ((current?.gallery_urls as string[] | null) ?? []).filter(Boolean);
  const kept = keptGallery(before, fd);
  const room = Math.max(0, MAX_GALLERY - kept.length);
  const added: string[] = [];
  for (const [i, file] of gallery.slice(0, room).entries()) {
    const url = await upload(supabase, "businesses", `${id}-g${i}`, file);
    if (url) added.push(url);
  }
  if (added.length || kept.length !== before.length) {
    await supabase
      .from("businesses")
      .update({ gallery_urls: [...kept, ...added] })
      .eq("id", id);
  }

  refreshSite();
  redirect(`/admin/businesses?saved=1`);
}

export async function setBusinessPublished(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(fd);
  if (id) {
    const supabase = await createClient();
    await supabase
      .from("businesses")
      .update({ is_published: str(fd, "publish") === "true" })
      .eq("id", id);
    refreshSite();
  }
  redirect(str(fd, "return_to").startsWith("/admin/") ? str(fd, "return_to") : "/admin/businesses");
}

export async function deleteBusiness(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(fd);
  if (id) {
    const supabase = await createClient();
    const { error } = await supabase.from("businesses").delete().eq("id", id);
    if (error) redirect(`/admin/businesses/${id}?error=1`);
    refreshSite();
  }
  redirect("/admin/businesses?deleted=1");
}

// ---------------------------------------------------------------- offers

export async function saveOffer(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseOfferForm(fd);
  const errors: FieldErrors = parsed.ok ? {} : { ...parsed.errors };
  const image = imageFile(fd, "image", errors);
  if (!parsed.ok || Object.keys(errors).length) return { errors };

  const supabase = await createClient();
  let id = idFrom(fd);
  const { coupon_code, daily, ...values } = parsed.values;

  if (id) {
    const { error } = await supabase.from("offers").update(values).eq("id", id);
    if (error) return { message: dbMessage(error.message) };
  } else {
    const { data, error } = await supabase.from("offers").insert(values).select("id").single();
    if (error || !data) return { message: dbMessage(error?.message ?? "") };
    id = data.id as string;
  }

  // Codes live in an admin-only table and never reach the public site.
  if (coupon_code) {
    await supabase.from("offer_codes").upsert({ offer_id: id, coupon_code });
  } else {
    await supabase.from("offer_codes").delete().eq("offer_id", id);
  }

  // Daily codes: replace everything from the first day of the pasted list onward.
  if (daily.length > 0) {
    await supabase.from("offer_daily_codes").delete().eq("offer_id", id).gte("day", daily[0]!.day);
    const { error } = await supabase
      .from("offer_daily_codes")
      .insert(daily.map((d) => ({ offer_id: id, day: d.day, code: d.code })));
    if (error) return { message: dbMessage(error.message) };
  }

  if (fd.get("remove_image") === "on") {
    await supabase.from("offers").update({ image_url: null }).eq("id", id);
  }
  if (image) {
    const url = await upload(supabase, "offers", id, image);
    if (url) await supabase.from("offers").update({ image_url: url }).eq("id", id);
  }

  refreshSite();
  redirect(`/admin/offers?saved=1`);
}

export async function setOfferPublished(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(fd);
  if (id) {
    const supabase = await createClient();
    await supabase
      .from("offers")
      .update({ is_published: str(fd, "publish") === "true" })
      .eq("id", id);
    refreshSite();
  }
  redirect(str(fd, "return_to").startsWith("/admin/") ? str(fd, "return_to") : "/admin/offers");
}

export async function deleteOffer(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(fd);
  if (id) {
    const supabase = await createClient();
    await supabase.from("offers").delete().eq("id", id);
    refreshSite();
  }
  redirect("/admin/offers?deleted=1");
}

// ---------------------------------------------------------------- team

export async function setRole(fd: FormData): Promise<void> {
  await requireAdmin();
  const role = str(fd, "role") === "admin" ? "admin" : "member";
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_role", {
    p_email: str(fd, "email"),
    p_role: role,
  });
  if (!error) redirect("/admin/team?ok=1");
  const code = error.message.includes("No member")
    ? "not_found"
    : error.message.includes("last admin")
      ? "last_admin"
      : "failed";
  redirect(`/admin/team?error=${code}`);
}
