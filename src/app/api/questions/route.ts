import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createRequestNumber, getNewRequestStatus } from "@/lib/requests";
import { questionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = questionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const status = await getNewRequestStatus();
  const item = await prisma.transportRequest.create({
    data: {
      comment: parsed.data.question,
      name: "FAQ питання",
      phone: parsed.data.contact,
      requestNumber: createRequestNumber(),
      statusId: status.id,
      type: "FAQ",
    },
  });

  const result = await sendMail({
    subject: "Питання з FAQ",
    text: `Контакт: ${parsed.data.contact}\nПитання: ${parsed.data.question}`,
  }).catch(() => null);
  if (result && !result.skipped) {
    await prisma.transportRequest.update({ data: { emailSent: true }, where: { id: item.id } });
  }

  return NextResponse.json({ ok: true });
}
