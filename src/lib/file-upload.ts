const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

async function uploadViaApi(file: File, type: "image" | "video"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : `Upload failed (${res.status})`
    );
  }

  if (!data?.url || typeof data.url !== "string") {
    throw new Error("Upload succeeded but no URL was returned.");
  }

  return data.url;
}

export async function processImageUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPG, PNG, or WebP).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Profile picture must be under 10 MB.");
  }
  return uploadViaApi(file, "image");
}

export async function processVideoUpload(file: File): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Please upload a video file (MP4, WebM, etc.).");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Each video must be under 100 MB.");
  }
  return uploadViaApi(file, "video");
}

export const uploadLimits = {
  maxVideos: 3,
  maxImageMB: 10,
  maxVideoMB: 100,
};
