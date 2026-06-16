import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/utils";
import { createInviteToken, getInviteExpiresAt, hashInviteToken } from "@/lib/auth/employee-invitations";
import { logPasswordResetEvent } from "@/lib/auth/password-reset-logging";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string }> };
const schema = z.object({
  locale: z.enum(["uk", "en"]).default("uk"),
  requestId: z.string().cuid().optional(),
});

export async function POST(request: Request, { params }: RouteProps) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Некоректна мова" }, { status: 400 });
  const { id } = await params;
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: "Співробітника не знайдено" }, { status: 404 });
  if (employee.role === "OWNER") {
    return NextResponse.json({ error: "OWNER змінює пароль лише через email-відновлення" }, { status: 403 });
  }
  const resetRequest = parsed.data.requestId
    ? await prisma.passwordResetRequest.findFirst({
        where: {
          id: parsed.data.requestId,
          status: { in: ["NEW", "VIEWED"] },
          userId: id,
        },
      })
    : null;
  if (parsed.data.requestId && !resetRequest) {
    return NextResponse.json({ error: "Запит не знайдено або вже оброблено" }, { status: 409 });
  }

  const token = createInviteToken();
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.employeeInvitation.updateMany({
        data: { status: "EXPIRED" },
        where: { status: "PENDING", userId: id },
      });
      await transaction.employeeInvitation.create({
        data: {
          createdById: admin.id,
          email: employee.email,
          expiresAt: getInviteExpiresAt(),
          passwordResetRequestId: resetRequest?.id,
          role: employee.role,
          tokenHash: hashInviteToken(token),
          userId: id,
        },
      });
      if (resetRequest) {
        const relatedRequests = await transaction.passwordResetRequest.findMany({
          select: { id: true },
          where: {
            id: { not: resetRequest.id },
            status: { in: ["NEW", "VIEWED"] },
            userId: id,
          },
        });
        await transaction.passwordResetRequest.update({
          data: {
            completedAt: new Date(),
            handledAt: new Date(),
            handledById: admin.id,
            status: "COMPLETED",
            events: {
              create: {
                actorId: admin.id,
                type: "RESET_LINK_CREATED",
              },
            },
          },
          where: { id: resetRequest.id },
        });
        for (const related of relatedRequests) {
          await transaction.passwordResetRequest.update({
            data: {
              status: "EXPIRED",
              events: {
                create: {
                  actorId: admin.id,
                  details: "Замінено новішим запитом цього користувача.",
                  type: "EXPIRED",
                },
              },
            },
            where: { id: related.id },
          });
        }
      }
    });
  } catch (error) {
    logPasswordResetEvent("manager_reset_link_failed", {
      actorId: admin.id,
      error,
      requestId: resetRequest?.id,
      userId: id,
    });
    return NextResponse.json({ error: "Не вдалося створити reset-посилання" }, { status: 500 });
  }
  if (resetRequest) {
    logPasswordResetEvent("manager_reset_link_created", {
      actorId: admin.id,
      requestId: resetRequest.id,
      userId: id,
    });
  }
  const baseUrl = getAppBaseUrl(request.url);
  const inviteUrl = new URL(`/${parsed.data.locale}/accept-invite`, baseUrl);
  inviteUrl.searchParams.set("token", token);
  return NextResponse.json({ inviteUrl: inviteUrl.toString(), ok: true });
}
