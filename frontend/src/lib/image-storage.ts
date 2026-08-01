import { apiFetch, hasApiBase } from "@/lib/api-client";
import { getAdminToken } from "@/lib/admin-session";

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const DEFAULT_MAX_WIDTH = 1800;
const DEFAULT_MAX_HEIGHT = 1400;
const DEFAULT_QUALITY = 0.82;

export type OptimizedImage = {
  dataUrl: string;
  name: string;
  originalBytes: number;
  optimizedBytes: number;
  width: number;
  height: number;
};

type UploadedImage = {
  url: string;
  publicId?: string;
  filePath?: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

export async function optimizeImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<OptimizedImage> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  if (file.size > MAX_SOURCE_BYTES) throw new Error(`${file.name} is larger than 12MB`);

  const source = await readFileAsDataUrl(file);
  const img = await loadImage(source);
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image optimization is not available in this browser");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/webp", quality);
  return {
    dataUrl,
    name: file.name,
    originalBytes: file.size,
    optimizedBytes: dataUrlBytes(dataUrl),
    width,
    height,
  };
}

export async function optimizeImageFiles(files: FileList | File[], limit = 12) {
  const list = Array.from(files).slice(0, limit);
  return Promise.all(list.map((file) => optimizeImageFile(file)));
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64 = ""] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? "image/webp";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadOptimizedImage(image: OptimizedImage) {
  const form = new FormData();
  form.append("file", dataUrlToBlob(image.dataUrl), image.name.replace(/\.[^.]+$/, ".webp"));
  return apiFetch<UploadedImage>("/admin/uploads/image", {
    method: "POST",
    body: form,
    token: getAdminToken(),
  });
}

export async function storeImageFiles(files: FileList | File[], limit = 12) {
  const optimized = await optimizeImageFiles(files, limit);
  const canUploadToImageKit = hasApiBase() && Boolean(getAdminToken());

  if (!canUploadToImageKit) {
    return {
      urls: optimized.map((image) => image.dataUrl),
      count: optimized.length,
      storedRemotely: false,
    };
  }

  try {
    const uploaded = await Promise.all(optimized.map(uploadOptimizedImage));
    return {
      urls: uploaded.map((image) => image.url),
      count: uploaded.length,
      storedRemotely: true,
    };
  } catch {
    return {
      urls: optimized.map((image) => image.dataUrl),
      count: optimized.length,
      storedRemotely: false,
    };
  }
}
