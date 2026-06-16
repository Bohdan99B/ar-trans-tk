import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { createRequestNumber, getNewRequestStatus } from "@/lib/requests";
import { contactSchema } from "@/lib/validations";

function getEmailErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error";
}

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

  try {
    const result = await sendMail({
      subject: "Зворотній зв'язок для клієнта",
      text: `Контакт: ${parsed.data.contact}\nЗручний час: ${parsed.data.time ?? "-"}`,
    });
    if (!result.skipped) {
      await prisma.transportRequest.update({ data: { emailSent: true }, where: { id: item.id } }).catch((error) => {
        console.error("Failed to mark contact request email as sent.", { error, requestId: item.id });
      });
    } else {
      await prisma.transportRequest.update({
        data: { emailError: "Gmail SMTP не налаштовано; лист не відправлено." },
        where: { id: item.id },
      }).catch((error) => {
        console.error("Failed to record skipped contact request email.", { error, requestId: item.id });
      });
    }
  } catch (error) {
    const emailError = getEmailErrorMessage(error);
    console.error("Contact request email notification failed.", { error, requestId: item.id });
    await prisma.transportRequest.update({
      data: { emailError },
      where: { id: item.id },
    }).catch((updateError) => {
      console.error("Failed to record contact request email error.", { error: updateError, requestId: item.id });
    });
  }

  return NextResponse.json({ ok: true });
}
