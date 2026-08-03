import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "./env.js";

export function initCloudinary() {
  const env = getEnv();
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    return { enabled: false };
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  return { enabled: true };
}
export async function uploadImageBuffer({ buffer, folder, publicId }) {
  const init = initCloudinary();
  if (!init.enabled) throw new Error("Cloudinary is not configured");

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}
