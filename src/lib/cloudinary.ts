import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    throw new Error("CLOUDINARY_URL is not set");
  }

  if (!configured) {
    cloudinary.config({ cloudinary_url: url });
    configured = true;
  }

  return cloudinary;
}

export function uploadBuffer(
  buffer: Buffer,
  options: {
    resourceType: "image" | "video";
    folder?: string;
  }
): Promise<{ secure_url: string; public_id: string; resource_type: string }> {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        resource_type: options.resourceType,
        folder: options.folder ?? "upnext-creators",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      }
    );
    stream.end(buffer);
  });
}
