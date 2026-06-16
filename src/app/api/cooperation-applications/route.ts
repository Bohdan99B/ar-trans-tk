import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { cooperationApplicationSchema } from "@/lib/validations";

function getEmailErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error";
}

export async function POST(request: Request) {
  const parsed = cooperationApplicationSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Перевірте обов'язкові поля.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { customDirection, vacancyId, ...contact } = parsed.data;
  const vacancy = vacancyId ? await prisma.vacancy.findFirst({
    select: { id: true, titleUk: true },
    where: { id: vacancyId, isPublished: true, status: "ACTIVE" },
  }) : null;

  if (vacancyId && !vacancy) {
    return NextResponse.json({ error: "Обраний напрям більше недоступний." }, { status: 404 });
  }

  const application = await prisma.cooperationApplication.create({
    data: {
      ...contact,
      customDirection: vacancy ? null : customDirection,
      vacancyId: vacancy?.id,
    },
    select: {
      city: true,
      comment: true,
      email: true,
      id: true,
      name: true,
      phone: true,
    },
  });
  const direction = vacancy?.titleUk ?? customDirection!;

  try {
    const result = await sendMail({
      subject: "Нова заявка на співпрацю",
      text: [
        `Ім'я: ${application.name}`,
        `Телефон: ${application.phone}`,
        `Email: ${application.email}`,
        `Місто: ${application.city}`,
        `Напрям співпраці: ${direction}`,
        `Коментар: ${application.comment || "-"}`,
      ].join("\n"),
    });
    if (!result.skipped) {
      await prisma.cooperationApplication.update({
        data: { emailSent: true },
        where: { id: application.id },
      }).catch((error) => {
        console.error("Failed to mark cooperation application email as sent.", {
          applicationId: application.id,
          error,
        });
      });
    } else {
      await prisma.cooperationApplication.update({
        data: { emailError: "Gmail SMTP не налаштовано; лист не відправлено." },
        where: { id: application.id },
      }).catch((error) => {
        console.error("Failed to record skipped cooperation application email.", {
          applicationId: application.id,
          error,
        });
      });
    }
  } catch (error) {
    const emailError = getEmailErrorMessage(error);
    console.error("Cooperation application email notification failed.", {
      applicationId: application.id,
      error,
    });
    await prisma.cooperationApplication.update({
      data: { emailError },
      where: { id: application.id },
    }).catch((updateError) => {
      console.error("Failed to record cooperation application email error.", {
        applicationId: application.id,
        error: updateError,
      });
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
