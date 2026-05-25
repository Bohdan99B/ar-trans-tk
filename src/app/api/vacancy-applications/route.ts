import { NextResponse } from "next/server";

import { uploadCmsFile } from "@/lib/cloudinary";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { vacancyApplicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const data = await request.formData();
  const parsed = vacancyApplicationSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) {
    return NextResponse.json({ error: "Перевірте поля" }, { status: 400 });
  }
  const vacancy = await prisma.vacancy.findFirst({ where: { id: parsed.data.vacancyId, status: "ACTIVE" } });
  if (!vacancy) {
    return NextResponse.json({ error: "Вакансію не знайдено" }, { status: 404 });
  }
  const cv = data.get("cv");
  let uploaded: { public_id: string; secure_url: string } | null = null;
  if (cv instanceof File && cv.size > 0) {
    try {
      uploaded = await uploadCmsFile(cv, "cv", undefined, "raw");
    } catch {
      return NextResponse.json({ error: "Не вдалося завантажити CV" }, { status: 503 });
    }
  }
  await prisma.vacancyApplication.create({
    data: {
      ...parsed.data,
      cvPublicId: uploaded?.public_id,
      cvUrl: uploaded?.secure_url,
    },
  });
  await sendMail({
    subject: `Нова заявка кандидата: ${vacancy.titleUk}`,
    text: `${parsed.data.name}\n${parsed.data.phone}\n${parsed.data.email ?? "-"}\n${parsed.data.comment ?? "-"}`,
  }).catch(() => null);
  return NextResponse.json({ ok: true }, { status: 201 });
}
