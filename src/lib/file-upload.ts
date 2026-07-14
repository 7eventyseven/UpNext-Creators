const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export async function processImageUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPG, PNG, or WebP).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Profile picture must be under 2 MB.");
  }
  return readFileAsDataUrl(file);
}

export async function processVideoUpload(file: File): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new Error("Please upload a video file (MP4, WebM, etc.).");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Each video must be under 4 MB for this demo.");
  }
  return readFileAsDataUrl(file);
}

export const uploadLimits = {
  maxVideos: 3,
  maxImageMB: 2,
  maxVideoMB: 4,
};
