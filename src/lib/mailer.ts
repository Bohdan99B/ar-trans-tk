import nodemailer from "nodemailer";

type MailOptions = {
  subject: string;
  text: string;
  to?: string;
};

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendMail(options: MailOptions) {
  if (!hasSmtpConfig()) {
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
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
  });
  const from = process.env.SMTP_FROM as string;

  return transporter.sendMail({
    from,
    to: options.to ?? process.env.MANAGER_EMAIL ?? from,
    subject: options.subject,
    text: options.text,
  });
}
