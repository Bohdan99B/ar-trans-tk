import nodemailer from "nodemailer";

type MailOptions = {
  subject: string;
  text: string;
  to?: string;
};

type MailResult = { skipped: true } | { skipped: false };

function getFromAddress(email: string) {
  const name = process.env.SMTP_FROM_NAME ?? "AR Trans TK";

  return `"${name.replaceAll('"', "'")}" <${email}>`;
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  const host = process.env.SMTP_HOST;
  const fromEmail = process.env.SMTP_FROM;

  if (!host || !fromEmail) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            pass: process.env.SMTP_PASSWORD,
            user: process.env.SMTP_USER,
          }
        : undefined,
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
  });
  const from = getFromAddress(fromEmail);

  await transporter.sendMail({
    from,
    to: options.to ?? process.env.MANAGER_EMAIL ?? fromEmail,
    subject: options.subject,
    text: options.text,
  });

  return { skipped: false };
}
