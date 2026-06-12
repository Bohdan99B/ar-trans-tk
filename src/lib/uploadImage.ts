import sharp from "sharp";

import { deleteCloudinaryFile, uploadBuffer } from "@/lib/cloudinary";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type ImageUploadKind = "fleet" | "logo";

type UploadImageSettings = {
  folder: string;
  height?: number;
  quality: number;
  width: number;
};

export type UploadedImage = {
  key: string;
  mimeType: "image/webp";
  size: number;
  url: string;
};

const uploadSettings = {
  fleet: {
    folder: "AR-Trans/fleet",
    height: 675,
    quality: 85,
    width: 1200,
  },
  logo: {
    folder: "AR-Trans/settings/logo",
    quality: 90,
    width: 800,
  },
} satisfies Record<ImageUploadKind, UploadImageSettings>;

export class UploadImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadImageError";
  }
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new UploadImageError("Можна завантажувати тільки зображення JPEG, PNG, WEBP або AVIF");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadImageError("Максимальний розмір фото — 5MB");
  }
}

export async function uploadImage(file: File, kind: ImageUploadKind, publicId?: string): Promise<UploadedImage> {
  validateImageFile(file);

  const config: UploadImageSettings = uploadSettings[kind];
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(inputBuffer);
  const resized = config.height
    ? pipeline.resize(config.width, config.height, {
        background: { alpha: 1, b: 42, g: 23, r: 15 },
        fit: "contain",
        position: "center",
        withoutEnlargement: true,
      })
    : pipeline.resize({ width: config.width, withoutEnlargement: true });
  const optimizedBuffer = await resized
    .webp({ quality: config.quality })
    .toBuffer();

  const result = await uploadBuffer(optimizedBuffer, {
    folder: config.folder,
    publicId,
    resourceType: "image",
  });

  return {
    key: result.public_id,
    mimeType: "image/webp",
    size: optimizedBuffer.length,
    url: result.secure_url,
  };
}

export async function deleteImage(publicId?: string | null) {
  await deleteCloudinaryFile(publicId, "image");
}
