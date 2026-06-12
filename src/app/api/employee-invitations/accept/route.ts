import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashInviteToken } from "@/lib/employee-invitations";
import { logPasswordResetEvent } from "@/lib/password-reset-logging";
import { prisma } from "@/lib/prisma";

const acceptInviteSchema = z.object({
  password: z.string().min(10, "Пароль має містити щонайменше 10 символів"),
  token: z.string().min(20, "Некоректне запрошення"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Перевірте дані" }, { status: 400 });
  }

  const tokenHash = hashInviteToken(parsed.data.token);
  const invitation = await prisma.employeeInvitation.findUnique({
    include: { user: true },
    where: { tokenHash },
  });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
    if (invitation?.status === "PENDING" && invitation.expiresAt <= new Date()) {
      await prisma.employeeInvitation.update({
        data: { status: "EXPIRED" },
        where: { id: invitation.id },
      });
    }
    return NextResponse.json({ error: "Запрошення недійсне або прострочене" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      data: { passwordHash },
      where: { id: invitation.userId },
    }),
    prisma.employeeInvitation.update({
      data: {
        acceptedAt: new Date(),
        status: "ACCEPTED",
      },
      where: { id: invitation.id },
    }),
    ...(invitation.passwordResetRequestId
      ? [
          prisma.passwordResetEvent.create({
            data: {
              details: "Менеджер встановив новий пароль через invite-посилання.",
              requestId: invitation.passwordResetRequestId,
              type: "COMPLETED",
            },
          }),
        ]
      : []),
  ]);
  if (invitation.passwordResetRequestId) {
    logPasswordResetEvent("manager_password_changed", {
      requestId: invitation.passwordResetRequestId,
      userId: invitation.userId,
    });
  }

  return NextResponse.json({ ok: true, email: invitation.user.email });
}
