import nodemailer from "nodemailer";

type MailOptions = {
  subject: string;
  text: string;
  to?: string;
};

type MailResult = { skipped: true } | { skipped: false };

function getEnv(name: string) {
  const value = process.env[name]?.trim();

  return value || undefined;
}

function getFromAddress(email: string) {
  if (email.includes("<") && email.includes(">")) {
    return email;
  }

  return `"AR Trans TK" <${email}>`;
}

function getGmailTransportConfig() {
  const host = getEnv("GMAIL_SMTP_HOST");
  const portValue = getEnv("GMAIL_SMTP_PORT");
  const secureValue = getEnv("GMAIL_SMTP_SECURE");
  const user = getEnv("GMAIL_SMTP_USER");
  const password = getEnv("GMAIL_SMTP_APP_PASSWORD");
  const fromEmail = getEnv("MAIL_FROM");
  const to = getEnv("MAIL_TO");
  const port = Number(portValue);
  const secure = secureValue === "true";

  if (
    host !== "smtp.gmail.com" ||
    port !== 465 ||
    secureValue !== "true" ||
    !user ||
    !password ||
    !fromEmail ||
    !to
  ) {
    console.error(
      [
        "Email delivery is not configured.",
        "Set GMAIL_SMTP_HOST=smtp.gmail.com, GMAIL_SMTP_PORT=465, GMAIL_SMTP_SECURE=true, GMAIL_SMTP_USER,",
        "GMAIL_SMTP_APP_PASSWORD, MAIL_FROM, and MAIL_TO in the server environment.",
      ].join(" "),
    );
    return null;
  }

  return { fromEmail, host, password, port, secure, to, user };
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  const config = getGmailTransportConfig();

  if (!config) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    auth: {
      pass: config.password,
      user: config.user,
    },
    host: config.host,
    port: config.port,
    secure: config.secure,
  });
  const from = getFromAddress(config.fromEmail);

  try {
    await transporter.sendMail({
      from,
      to: options.to ?? config.to,
      subject: options.subject,
      text: options.text,
    });
  } catch (error) {
    console.error("Email delivery failed.", error);
    throw error;
  }

  return { skipped: false };
}
