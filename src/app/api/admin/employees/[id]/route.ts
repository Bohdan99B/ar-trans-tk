import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { canDeleteEmployee } from "@/lib/employee-permissions";
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
    return NextResponse.json({ error: "Не можна видалити власний акаунт" }, { status: 403 });
  }

  const employee = await prisma.user.findUnique({
    select: { id: true, role: true },
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Співробітника не знайдено" }, { status: 404 });
  }

  if (!canDeleteEmployee(admin, employee)) {
    return NextResponse.json({ error: "ADMIN не може видалити OWNER" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
