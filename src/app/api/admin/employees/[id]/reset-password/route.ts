import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createInviteToken, getInviteExpiresAt, hashInviteToken } from "@/lib/employee-invitations";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string }> };
const schema = z.object({ locale: z.enum(["uk", "en"]).default("uk") });

export async function POST(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Некоректна мова" }, { status: 400 });
  const { id } = await params;
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: "Співробітника не знайдено" }, { status: 404 });

  const token = createInviteToken();
  await prisma.$transaction([
    prisma.employeeInvitation.updateMany({
      data: { status: "EXPIRED" },
      where: { status: "PENDING", userId: id },
    }),
    prisma.employeeInvitation.create({
      data: {
        createdById: admin.id,
        email: employee.email,
        expiresAt: getInviteExpiresAt(),
        role: employee.role,
        tokenHash: hashInviteToken(token),
        userId: id,
      },
    }),
  ]);
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const inviteUrl = new URL(`/${parsed.data.locale}/accept-invite`, baseUrl);
  inviteUrl.searchParams.set("token", token);
  return NextResponse.json({ inviteUrl: inviteUrl.toString(), ok: true });
}
