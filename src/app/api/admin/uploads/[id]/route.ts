import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Доступ заборонено" }, { status: 401 });
  }

  const { id } = await params;
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return NextResponse.json({ message: "Файл не знайдено" }, { status: 404 });
  }
  if (file.entityType === "logo" && !isAdminRole(user.role)) {
    return NextResponse.json({ message: "Доступ заборонено" }, { status: 403 });
  }

  await deleteImage(file.key).catch(() => null);
  await prisma.$transaction([
    prisma.file.delete({ where: { id } }),
    ...(file.entityType === "fleet" && file.entityId
      ? [
          prisma.vehicle.updateMany({
            data: { photoPublicId: null, photoUrl: null },
            where: { id: file.entityId, photoPublicId: file.key },
          }),
        ]
      : []),
    ...(file.entityType === "logo"
      ? [
          prisma.siteSetting.deleteMany({
            where: { key: { in: ["brand.logo", "brand.logoKey"] } },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
