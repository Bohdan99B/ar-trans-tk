import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { orderRequestSchema } from "@/lib/validators";

function createRequestNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `ART-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Перевірте обов'язкові поля.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const status = await prisma.requestStatus.upsert({
    create: {
      code: "new",
      titleEn: "New",
      titleUk: "Нова",
    },
    update: {},
    where: { code: "new" },
  });

  const transportRequest = await prisma.transportRequest.create({
    data: {
      ...parsed.data,
      requestNumber: createRequestNumber(),
      statusId: status.id,
    },
    select: {
      cargoType: true,
      destination: true,
      email: true,
      id: true,
      name: true,
      origin: true,
      phone: true,
      requestNumber: true,
      temperatureMode: true,
      weight: true,
    },
  });

  try {
    await sendMail({
      subject: `Нова заявка ${transportRequest.requestNumber}`,
      text: [
        `Номер: ${transportRequest.requestNumber}`,
        `Клієнт: ${transportRequest.name}`,
        `Телефон: ${transportRequest.phone}`,
        `Email: ${transportRequest.email ?? "-"}`,
        `Маршрут: ${transportRequest.origin} -> ${transportRequest.destination}`,
        `Вантаж: ${transportRequest.cargoType}`,
        `Температура: ${transportRequest.temperatureMode}`,
        `Вага: ${transportRequest.weight}`,
      ].join("\n"),
    });
    await prisma.transportRequest.update({
      data: { emailSent: true },
      where: { id: transportRequest.id },
    });
  } catch (error) {
    await prisma.transportRequest.update({
      data: {
        emailError: error instanceof Error ? error.message : "Unknown email error",
      },
      where: { id: transportRequest.id },
    });
  }

  return NextResponse.json(
    { ok: true, requestNumber: transportRequest.requestNumber },
    { status: 201 },
  );
}
