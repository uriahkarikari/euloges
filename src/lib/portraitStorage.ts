import { createClient } from "@/lib/supabase/client";

const BUCKET = "memorial-portraits";

export async function uploadMemorialPortrait(
  memorialId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to upload a memorial portrait.");
  }

  const extension = getFileExtension(file);
  const fileName = `portrait-${Date.now()}.${extension}`;
  const path = `${user.id}/${memorialId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteMemorialPortrait(
  portraitUrl: string,
): Promise<void> {
  if (!portraitUrl) {
    return;
  }

  const path = getStoragePathFromPublicUrl(portraitUrl);

  if (!path) {
    return;
  }

  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw error;
  }
}

function getFileExtension(file: File): string {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error("Unsupported portrait image type.");
  }
}

function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}
