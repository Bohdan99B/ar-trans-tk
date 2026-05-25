import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

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

async function getMailConfig() {
  const values = await prisma.siteSetting.findMany({
    where: { OR: [{ key: { startsWith: "smtp." } }, { key: "contact.recipientEmail" }] },
  });
  const settings = Object.fromEntries(values.map(({ key, value }) => [key, value]));

  return {
    fromEmail: settings["smtp.from"] || process.env.SMTP_FROM,
    host: settings["smtp.host"] || process.env.SMTP_HOST,
    password: settings["smtp.password"] || process.env.SMTP_PASSWORD,
    port: settings["smtp.port"] || process.env.SMTP_PORT || "587",
    secure: (settings["smtp.secure"] || process.env.SMTP_SECURE) === "true",
    to: settings["contact.recipientEmail"] || process.env.MANAGER_EMAIL,
    user: settings["smtp.user"] || process.env.SMTP_USER,
  };
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  const config = await getMailConfig();

  if (!config.host || !config.fromEmail) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    auth:
      config.user && config.password
        ? {
            pass: config.password,
            user: config.user,
          }
        : undefined,
    host: config.host,
    port: Number(config.port),
    secure: config.secure,
  });
  const from = getFromAddress(config.fromEmail);

  await transporter.sendMail({
    from,
    to: options.to ?? config.to ?? config.fromEmail,
    subject: options.subject,
    text: options.text,
  });

  return { skipped: false };
}
