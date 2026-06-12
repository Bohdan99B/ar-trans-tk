import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, UploadImageError } from "@/lib/uploadImage";

export async function POST(request: Request) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Доступ заборонено" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const entityId = String(formData.get("entityId") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Файл не передано" }, { status: 400 });
  }

  try {
    const uploaded = await uploadImage(file, "fleet");
    const record = await prisma.file.create({
      data: {
        entityId,
        entityType: "fleet",
        key: uploaded.key,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        url: uploaded.url,
        userId: user.id,
      },
    });

    return NextResponse.json({ id: record.id, key: uploaded.key, url: uploaded.url }, { status: 201 });
  } catch (error) {
    const message = error instanceof UploadImageError
      ? error.message
      : "Не вдалося завантажити фото. Перевірте Cloudinary налаштування";
    return NextResponse.json({ message }, { status: error instanceof UploadImageError ? 400 : 503 });
  }
}
