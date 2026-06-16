import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { logPasswordResetEvent } from "@/lib/auth/password-reset-logging";
import { getActionablePasswordResetWhere } from "@/lib/auth/password-reset-requests";
import { prisma } from "@/lib/prisma";

const activeStatuses = ["NEW", "VIEWED"] as const;
const pageSize = 5;

async function expireOldRequests() {
  const expired = await prisma.passwordResetRequest.findMany({
    select: { id: true, userId: true },
    where: {
      expiresAt: { lte: new Date() },
      status: { in: [...activeStatuses] },
    },
  });
  if (expired.length === 0) return;

  await prisma.$transaction(
    expired.flatMap((item) => [
      prisma.passwordResetRequest.update({
        data: { status: "EXPIRED" },
        where: { id: item.id },
      }),
      prisma.passwordResetEvent.create({
        data: { requestId: item.id, type: "EXPIRED" },
      }),
    ]),
  );
  expired.forEach((item) => {
    logPasswordResetEvent("request_expired", { requestId: item.id, userId: item.userId });
  });
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 });

  try {
    await expireOldRequests();
    const url = new URL(request.url);
    const activeCount = await prisma.passwordResetRequest.count({
      where: getActionablePasswordResetWhere(),
    });

    if (url.searchParams.get("summary") === "1") {
      return NextResponse.json({ activeCount });
    }

    const requestedPage = parsePositiveInteger(url.searchParams.get("page"), 1);
    const [totalCount, latestRequests] = await prisma.$transaction([
      prisma.passwordResetRequest.count(),
      prisma.passwordResetRequest.findMany({
        distinct: ["userId"],
        orderBy: [{ userId: "asc" }, { createdAt: "desc" }, { id: "desc" }],
        select: { status: true, userId: true },
      }),
    ]);
    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const requests = await prisma.passwordResetRequest.findMany({
      include: {
        events: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        handledBy: { select: { name: true } },
        invitation: { select: { status: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const statuses = Object.fromEntries(
      latestRequests.map((item) => [item.userId, item.status]),
    );

    return NextResponse.json({
      activeCount,
      page,
      pageCount,
      requests,
      statuses,
      totalCount,
    });
  } catch (error) {
    logPasswordResetEvent("admin_requests_load_failed", { actorId: admin.id, error });
    return NextResponse.json({ error: "Не вдалося завантажити запити" }, { status: 500 });
  }
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
