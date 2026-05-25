import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createRequestNumber, getNewRequestStatus } from "@/lib/requests";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const status = await getNewRequestStatus();
  const item = await prisma.transportRequest.create({
    data: {
      comment: parsed.data.time ? `Зручний час: ${parsed.data.time}` : null,
      name: "Запит на консультацію",
      phone: parsed.data.contact,
      requestNumber: createRequestNumber(),
      statusId: status.id,
      type: "CONSULTATION",
    },
  });

  const result = await sendMail({
    subject: "Зворотній зв'язок для клієнта",
    text: `Контакт: ${parsed.data.contact}\nЗручний час: ${parsed.data.time ?? "-"}`,
  }).catch(() => null);
  if (result && !result.skipped) {
    await prisma.transportRequest.update({ data: { emailSent: true }, where: { id: item.id } });
  }

  return NextResponse.json({ ok: true });
}
