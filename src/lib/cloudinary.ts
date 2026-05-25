import { v2 as cloudinary } from "cloudinary";

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  });
}

export { cloudinary, isCloudinaryConfigured };

export async function uploadFleetPhoto(filePath: string, publicId?: string) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  return cloudinary.uploader.upload(filePath, {
    folder: "ar-trans-tk/fleet",
    public_id: publicId,
  });
}

export async function uploadCmsFile(file: File, folder: string, publicId?: string, resourceType: "image" | "raw" = "image") {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  const contents = Buffer.from(await file.arrayBuffer()).toString("base64");
  const source = `data:${file.type || "application/octet-stream"};base64,${contents}`;
  return cloudinary.uploader.upload(source, {
    folder: `ar-trans-tk/${folder}`,
    public_id: publicId,
    resource_type: resourceType,
  });
}

export function getFleetPhotoUrl(publicId?: string | null) {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) {
    return "/fleet/hero-truck.svg";
  }

  return cloudinary.url(publicId, {
    crop: "fill",
    height: 640,
    quality: "auto",
    secure: true,
    width: 960,
  });
}
