import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { deleteImage, uploadImage, UploadImageError } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ message: "Доступ заборонено" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Файл не передано" }, { status: 400 });
  }

  try {
    const previousLogoKey = await prisma.siteSetting.findUnique({ where: { key: "brand.logoKey" } });
    const uploaded = await uploadImage(file, "logo");
    const record = await prisma.file.create({
      data: {
        entityId: null,
        entityType: "logo",
        key: uploaded.key,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        url: uploaded.url,
        userId: user.id,
      },
    });

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        create: { key: "brand.logo", value: uploaded.url },
        update: { value: uploaded.url },
        where: { key: "brand.logo" },
      }),
      prisma.siteSetting.upsert({
        create: { key: "brand.logoKey", value: uploaded.key },
        update: { value: uploaded.key },
        where: { key: "brand.logoKey" },
      }),
    ]);

    if (previousLogoKey?.value && previousLogoKey.value !== uploaded.key) {
      await deleteImage(previousLogoKey.value).catch(() => null);
      await prisma.file.deleteMany({ where: { key: previousLogoKey.value } });
    }

    return NextResponse.json({ id: record.id, key: uploaded.key, url: uploaded.url }, { status: 201 });
  } catch (error) {
    const message = error instanceof UploadImageError
      ? error.message
      : "Не вдалося завантажити логотип. Перевірте Cloudinary налаштування";
    return NextResponse.json({ message }, { status: error instanceof UploadImageError ? 400 : 503 });
  }
}
