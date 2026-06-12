import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { isOwnerEmail } from "@/lib/owner-account";
import { prisma } from "@/lib/prisma";

type EmployeeRouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: EmployeeRouteProps) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ error: "Адміністратор не може видалити сам себе" }, { status: 400 });
  }

  const employee = await prisma.user.findUnique({
    select: { email: true, id: true, role: true },
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Співробітника не знайдено" }, { status: 404 });
  }

  if (isOwnerEmail(employee.email)) {
    return NextResponse.json({ error: "Owner-акаунт не можна видалити" }, { status: 400 });
  }

  if (employee.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Не можна видалити останнього адміністратора" }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
