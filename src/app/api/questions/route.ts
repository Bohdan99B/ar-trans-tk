import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createRequestNumber, getNewRequestStatus } from "@/lib/requests";
import { questionSchema } from "@/lib/validators";

function getEmailErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error";
}

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

  try {
    const result = await sendMail({
      subject: "Питання з FAQ",
      text: `Контакт: ${parsed.data.contact}\nПитання: ${parsed.data.question}`,
    });
    if (!result.skipped) {
      await prisma.transportRequest.update({ data: { emailSent: true }, where: { id: item.id } }).catch((error) => {
        console.error("Failed to mark question email as sent.", { error, requestId: item.id });
      });
    } else {
      await prisma.transportRequest.update({
        data: { emailError: "Gmail SMTP не налаштовано; лист не відправлено." },
        where: { id: item.id },
      }).catch((error) => {
        console.error("Failed to record skipped question email.", { error, requestId: item.id });
      });
    }
  } catch (error) {
    const emailError = getEmailErrorMessage(error);
    console.error("Question email notification failed.", { error, requestId: item.id });
    await prisma.transportRequest.update({
      data: { emailError },
      where: { id: item.id },
    }).catch((updateError) => {
      console.error("Failed to record question email error.", { error: updateError, requestId: item.id });
    });
  }

  return NextResponse.json({ ok: true });
}
