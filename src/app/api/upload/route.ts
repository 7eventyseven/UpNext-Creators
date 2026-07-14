import { NextRequest } from "next/server";
import { uploadBuffer } from "@/lib/cloudinary";
import { jsonError } from "@/lib/auth-server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const ALLOWED_IMAGE = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_VIDEO = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
]);

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_URL) {
      return jsonError("Cloudinary is not configured on the server.", 500);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") ?? "image");

    if (!(file instanceof File)) {
      return jsonError("No file uploaded.");
    }

    const resourceType = type === "video" ? "video" : "image";
    const maxBytes = resourceType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

    if (file.size > maxBytes) {
      const limitMb = Math.round(maxBytes / (1024 * 1024));
      return jsonError(
        resourceType === "video"
          ? `Video must be under ${limitMb} MB.`
          : `Image must be under ${limitMb} MB.`
      );
    }

    if (resourceType === "image" && !ALLOWED_IMAGE.has(file.type)) {
      return jsonError("Please upload a JPG, PNG, WebP, or GIF image.");
    }
    if (resourceType === "video" && !ALLOWED_VIDEO.has(file.type) && !file.type.startsWith("video/")) {
      return jsonError("Please upload a video file (MP4, WebM, MOV, etc.).");
    }
    if (resourceType === "image" && !file.type.startsWith("image/")) {
      return jsonError("Please upload an image file.");
    }
    if (resourceType === "video" && !file.type.startsWith("video/")) {
      return jsonError("Please upload a video file.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, {
      resourceType,
      folder:
        resourceType === "video"
          ? "upnext-creators/videos"
          : "upnext-creators/images",
    });

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload failed. Please try again.";
    return jsonError(message, 500);
  }
}
