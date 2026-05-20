import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mailer";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  await sendMail({
    subject: "Контакт у неробочий час",
    text: `Контакт: ${parsed.data.contact}\nЗручний час: ${parsed.data.time ?? "-"}`,
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
