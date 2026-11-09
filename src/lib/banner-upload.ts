import {
  IMAGE_MIME,
  MAX_BANNER_IMAGE_BYTES,
  MAX_BANNER_VIDEO_BYTES,
  VIDEO_MIME,
  type BannerMedia,
} from "@/lib/banners";
import { createClient } from "@/lib/supabase/client";

export type BannerUpload = { url: string; type: BannerMedia; path: string } | { error: string };

/** Checks a picked file and uploads it straight to storage (client side). */
export async function uploadBannerFile(file: File): Promise<BannerUpload> {
  const isImage = IMAGE_MIME.includes(file.type);
  const isVideo = VIDEO_MIME.includes(file.type);
  if (!isImage && !isVideo) return { error: "אפשר להעלות תמונה (JPG, PNG, WEBP) או סרטון (MP4, WEBM)." };
  if (isImage && file.size > MAX_BANNER_IMAGE_BYTES) return { error: "התמונה גדולה מדי (עד 5MB)." };
  if (isVideo && file.size > MAX_BANNER_VIDEO_BYTES) return { error: "הסרטון גדול מדי (עד 20MB). אפשר לדחוס אותו או לקצר." };
  const ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : file.type.split("/")[1]!.replace("jpeg", "jpg");
  const path = `banners/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "ההעלאה נכשלה. בדקי את גודל הקובץ ונסי שוב." };
  return { url: supabase.storage.from("media").getPublicUrl(path).data.publicUrl, type: isVideo ? "video" : "image", path };
}

export async function removeUploaded(path: string): Promise<void> {
  await createClient().storage.from("media").remove([path]);
}
