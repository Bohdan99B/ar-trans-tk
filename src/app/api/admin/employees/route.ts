import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-url";
import { createInviteToken, getInviteExpiresAt, hashInviteToken } from "@/lib/employee-invitations";
import { prisma } from "@/lib/prisma";

const createEmployeeSchema = z.object({
  email: z.string().trim().email("Некоректний email").toLowerCase(),
  locale: z.string().trim().regex(/^[a-z]{2}$/).optional().default("uk"),
  name: z.string().trim().min(2, "Вкажіть ім'я"),
  role: z.enum(["ADMIN", "MANAGER"]),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Перевірте дані" }, { status: 400 });
  }

  const { email, locale, name, role } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Користувач з таким email вже існує" }, { status: 409 });
  }

  const token = createInviteToken();
  const expiresAt = getInviteExpiresAt();

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: role as UserRole,
      employeeInvitations: {
        create: {
          createdById: admin.id,
          email,
          expiresAt,
          role: role as UserRole,
          tokenHash: hashInviteToken(token),
        },
      },
    },
    include: {
      employeeInvitations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const baseUrl = getAppBaseUrl(request.url);
  const inviteUrl = new URL(`/${locale}/accept-invite`, baseUrl);
  inviteUrl.searchParams.set("token", token);

  return NextResponse.json({
    employee: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    },
    expiresAt,
    inviteId: user.employeeInvitations[0]?.id,
    inviteUrl: inviteUrl.toString(),
  });
}
