import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { questionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = questionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  await sendMail({
    subject: "Питання з FAQ",
    text: `Контакт: ${parsed.data.contact}\nПитання: ${parsed.data.question}`,
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
