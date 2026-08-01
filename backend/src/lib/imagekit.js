import { getEnv } from "./env.js";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

export function initImageKit() {
  const env = getEnv();
  if (!env.IMAGEKIT_PRIVATE_KEY) {
    return { enabled: false };
  }
  return { enabled: true, privateKey: env.IMAGEKIT_PRIVATE_KEY };
}

export async function uploadImageBuffer({ buffer, folder = "haven-host", publicId, mimeType }) {
  const init = initImageKit();
  if (!init.enabled) throw new Error("ImageKit is not configured");

  const fileName = `${publicId ?? `image-${Date.now()}`}.webp`;
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType || "image/webp" }), fileName);
  form.append("fileName", fileName);
  form.append("folder", folder.startsWith("/") ? folder : `/${folder}`);
  form.append("useUniqueFileName", "true");

  const auth = Buffer.from(`${init.privateKey}:`).toString("base64");
  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload.message === "string" ? payload.message : "ImageKit upload failed";
    throw new Error(message);
  }

  return {
    url: payload.url,
    fileId: payload.fileId,
    name: payload.name,
    filePath: payload.filePath,
  };
}
