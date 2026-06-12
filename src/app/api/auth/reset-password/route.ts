import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPasswordResetToken } from "@/lib/password-reset";
import { logPasswordResetEvent } from "@/lib/password-reset-logging";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  password: z.string().min(10, "Пароль має містити щонайменше 10 символів."),
  token: z.string().min(20, "Посилання для відновлення некоректне."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Перевірте дані." }, { status: 400 });
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  let resetSucceeded = false;

  try {
    resetSucceeded = await prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findUnique({
        select: { expiresAt: true, id: true, requestId: true, userId: true },
        where: { tokenHash },
      });
      if (!resetToken || resetToken.expiresAt <= new Date()) {
        if (resetToken) {
          await transaction.passwordResetRequest.update({
            data: {
              status: "EXPIRED",
              events: { create: { type: "EXPIRED" } },
            },
            where: { id: resetToken.requestId },
          });
          await transaction.passwordResetToken.delete({ where: { id: resetToken.id } });
          logPasswordResetEvent("request_expired", {
            requestId: resetToken.requestId,
            userId: resetToken.userId,
          });
        }
        return false;
      }

      const claimed = await transaction.passwordResetToken.deleteMany({
        where: {
          id: resetToken.id,
          tokenHash,
        },
      });
      if (claimed.count !== 1) {
        return false;
      }

      await transaction.user.update({
        data: { passwordHash },
        where: { id: resetToken.userId },
      });
      await transaction.passwordResetRequest.update({
        data: {
          completedAt: new Date(),
          status: "COMPLETED",
          events: { create: { type: "COMPLETED" } },
        },
        where: { id: resetToken.requestId },
      });
      await transaction.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      });
      logPasswordResetEvent("password_changed", {
        requestId: resetToken.requestId,
        userId: resetToken.userId,
      });
      return true;
    });
  } catch (error) {
    logPasswordResetEvent("password_change_failed", { error });
    return NextResponse.json({ error: "Не вдалося змінити пароль. Спробуйте ще раз." }, { status: 500 });
  }

  if (!resetSucceeded) {
    return NextResponse.json({ error: "Посилання недійсне або прострочене." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
