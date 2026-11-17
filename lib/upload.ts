"use client";
import { createClient } from "@/lib/supabase/client";
import { randomKey } from "@/lib/utils";

const MAX_AUDIO = 12 * 1024 * 1024;

/** Shrinks a photo to at most `max` px on its longest side and re-encodes it as JPEG (keeps uploads fast on mobile data). */
async function compressImage(file: File, max = 1800, quality = 0.84): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process this photo."))), "image/jpeg", quality)
  );
}

/** Uploads a photo or song to the couple's own folder and returns its public URL. */
export async function uploadMedia(file: File, invitationId: string, kind: "photo" | "music"): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");

  let body: Blob = file;
  let ext = "jpg";
  let contentType = "image/jpeg";
  if (kind === "photo") {
    if (!file.type.startsWith("image/")) throw new Error("Choose a photo (JPG, PNG or WebP).");
    body = await compressImage(file);
  } else {
    if (!/^audio\/(mpeg|mp3|mp4|aac|x-m4a)$/.test(file.type)) throw new Error("Choose an MP3 or M4A song.");
    if (file.size > MAX_AUDIO) throw new Error("The song is larger than 12 MB. Try a shorter or lower-quality version.");
    ext = file.type === "audio/mpeg" || file.type === "audio/mp3" ? "mp3" : "m4a";
    contentType = file.type === "audio/mp3" ? "audio/mpeg" : file.type;
  }

  const path = `${user.id}/${invitationId}/${kind}-${Date.now()}-${randomKey(4)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, body, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Removes a file we uploaded earlier (ignores links to other sites). */
export async function deleteMedia(url: string) {
  const marker = "/storage/v1/object/public/media/";
  const i = url.indexOf(marker);
  if (i < 0) return;
  await createClient().storage.from("media").remove([decodeURIComponent(url.slice(i + marker.length))]);
}
