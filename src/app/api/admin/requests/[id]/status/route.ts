import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type StatusRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: StatusRouteProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.statusId) {
    return NextResponse.json({ error: "statusId is required" }, { status: 400 });
  }

  const updated = await prisma.transportRequest.update({
    data: { statusId: body.statusId },
    include: { status: true },
    where: { id },
  });

  return NextResponse.json({
    ok: true,
    requestNumber: updated.requestNumber,
    status: updated.status.titleUk,
  });
}
