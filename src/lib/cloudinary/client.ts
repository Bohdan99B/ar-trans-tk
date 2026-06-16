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
    folder: "AR-Trans/fleet",
    public_id: publicId,
  });
}

export async function uploadCmsFile(file: File, folder: string, publicId?: string, resourceType: "image" | "raw" = "image") {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<Awaited<ReturnType<typeof cloudinary.uploader.upload>>>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `AR-Trans/${folder}`,
        public_id: publicId,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function deleteCloudinaryFile(publicId?: string | null, resourceType: "image" | "raw" = "image") {
  if (!publicId || !isCloudinaryConfigured) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function uploadBuffer(
  buffer: Buffer,
  {
    folder,
    publicId,
    resourceType = "image",
  }: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "raw";
  },
) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise<Awaited<ReturnType<typeof cloudinary.uploader.upload>>>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder,
      public_id: publicId,
      resource_type: resourceType,
    }, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload failed"));
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
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
