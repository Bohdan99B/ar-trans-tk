import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { statusCheckSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = statusCheckSchema.safeParse({
    contact: searchParams.get("contact"),
    requestNumber: searchParams.get("requestNumber"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Вкажіть номер заявки та email або телефон." },
      { status: 400 },
    );
  }

  const contact = parsed.data.contact.toLowerCase();
  const transportRequest = await prisma.transportRequest.findUnique({
    include: { status: true },
    where: { requestNumber: parsed.data.requestNumber },
  });

  if (
    !transportRequest ||
    (transportRequest.email?.toLowerCase() !== contact &&
      transportRequest.phone.replace(/\D/g, "") !== parsed.data.contact.replace(/\D/g, ""))
  ) {
    return NextResponse.json({ error: "Заявку не знайдено." }, { status: 404 });
  }

  return NextResponse.json({
    createdAt: transportRequest.createdAt.toISOString(),
    requestNumber: transportRequest.requestNumber,
    route: `${transportRequest.origin} -> ${transportRequest.destination}`,
    status: transportRequest.status.titleUk,
  });
}
