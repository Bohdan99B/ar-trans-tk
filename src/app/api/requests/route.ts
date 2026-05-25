import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createRequestNumber, getNewRequestStatus } from "@/lib/requests";
import { orderRequestSchema } from "@/lib/validators";

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

  const status = await getNewRequestStatus();

  const transportRequest = await prisma.transportRequest.create({
    data: {
      ...parsed.data,
      requestNumber: createRequestNumber(),
      statusId: status.id,
      type: "ORDER",
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
    const mailResult = await sendMail({
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
    if (!mailResult.skipped) {
      await prisma.transportRequest.update({
        data: { emailSent: true },
        where: { id: transportRequest.id },
      });
    }
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
