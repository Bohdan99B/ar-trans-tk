import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { logPasswordResetEvent } from "@/lib/password-reset-logging";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum(["view", "cancel"]),
});

export async function PATCH(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некоректна дія" }, { status: 400 });

  const { id } = await params;
  const resetRequest = await prisma.passwordResetRequest.findUnique({
    select: { id: true, status: true, userId: true },
    where: { id },
  });
  if (!resetRequest) return NextResponse.json({ error: "Запит не знайдено" }, { status: 404 });

  try {
    if (parsed.data.action === "view") {
      if (resetRequest.status === "NEW") {
        await prisma.passwordResetRequest.update({
          data: {
            events: { create: { actorId: admin.id, type: "VIEWED" } },
            status: "VIEWED",
            viewedAt: new Date(),
          },
          where: { id },
        });
        logPasswordResetEvent("request_viewed", {
          actorId: admin.id,
          requestId: id,
          userId: resetRequest.userId,
        });
      }
    } else {
      if (!["NEW", "VIEWED"].includes(resetRequest.status)) {
        return NextResponse.json({ error: "Цей запит уже закрито" }, { status: 409 });
      }
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { requestId: id } }),
        prisma.employeeInvitation.updateMany({
          data: { status: "EXPIRED" },
          where: { passwordResetRequestId: id, status: "PENDING" },
        }),
        prisma.passwordResetRequest.update({
          data: {
            events: { create: { actorId: admin.id, type: "CANCELLED" } },
            handledAt: new Date(),
            handledById: admin.id,
            status: "CANCELLED",
          },
          where: { id },
        }),
      ]);
      logPasswordResetEvent("request_cancelled", {
        actorId: admin.id,
        requestId: id,
        userId: resetRequest.userId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPasswordResetEvent("request_action_failed", {
      actorId: admin.id,
      error,
      requestId: id,
      userId: resetRequest.userId,
    });
    return NextResponse.json({ error: "Не вдалося оновити запит" }, { status: 500 });
  }
}
