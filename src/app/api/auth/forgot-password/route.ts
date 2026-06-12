import { NextResponse } from "next/server";
import { z } from "zod";

import { getAppBaseUrl } from "@/lib/app-url";
import { sendMail } from "@/lib/mailer";
import { logPasswordResetEvent } from "@/lib/password-reset-logging";
import {
  createPasswordResetToken,
  getManagerResetRequestExpiresAt,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  locale: z.enum(["uk", "en"]).default("uk"),
});

const neutralMessage =
  "Запит прийнято. Якщо це акаунт менеджера, адміністратор отримає сповіщення; для адміністратора інструкції буде надіслано на його пошту.";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1000) : "Невідома помилка";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Вкажіть коректний email." }, { status: 400 });
  }

  const { email, locale } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      select: { id: true, name: true, role: true },
      where: { email },
    });

    if (!user) {
      logPasswordResetEvent("request_ignored_unknown_email");
      return NextResponse.json({ message: neutralMessage, ok: true });
    }

    const expiresAt = user.role === "MANAGER" ? getManagerResetRequestExpiresAt() : getPasswordResetExpiresAt();
    const resetRequest =
      user.role === "MANAGER"
        ? await prisma.$transaction(async (transaction) => {
            await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;
            const activeRequest = await transaction.passwordResetRequest.findFirst({
              orderBy: { createdAt: "desc" },
              select: { id: true },
              where: {
                expiresAt: { gt: new Date() },
                status: { in: ["NEW", "VIEWED"] },
                userId: user.id,
              },
            });

            if (activeRequest) {
              return transaction.passwordResetRequest.update({
                data: {
                  emailError: null,
                  events: {
                    create: {
                      details: "Користувач повторно надіслав запит.",
                      type: "CREATED",
                    },
                  },
                  expiresAt,
                  locale,
                  status: "NEW",
                  viewedAt: null,
                },
                select: { id: true },
                where: { id: activeRequest.id },
              });
            }

            return transaction.passwordResetRequest.create({
              data: {
                email,
                events: { create: { type: "CREATED" } },
                expiresAt,
                locale,
                role: user.role,
                userId: user.id,
              },
              select: { id: true },
            });
          })
        : await prisma.$transaction(async (transaction) => {
            await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;
            const previousRequests = await transaction.passwordResetRequest.findMany({
              select: { id: true },
              where: {
                status: { in: ["NEW", "VIEWED"] },
                userId: user.id,
              },
            });
            await transaction.passwordResetToken.deleteMany({ where: { userId: user.id } });
            for (const previous of previousRequests) {
              await transaction.passwordResetRequest.update({
                data: {
                  status: "EXPIRED",
                  events: {
                    create: {
                      details: "Замінено новішим запитом цього користувача.",
                      type: "EXPIRED",
                    },
                  },
                },
                where: { id: previous.id },
              });
            }
            return transaction.passwordResetRequest.create({
              data: {
                email,
                events: { create: { type: "CREATED" } },
                expiresAt,
                locale,
                role: user.role,
                userId: user.id,
              },
              select: { id: true },
            });
          });
    logPasswordResetEvent("request_created", { requestId: resetRequest.id, userId: user.id });

    if (user.role === "MANAGER") {
      try {
        const result = await sendMail({
          subject: "Новий запит менеджера на відновлення доступу",
          text: [
            `Менеджер ${user.name ?? email} запросив відновлення доступу.`,
            `Email: ${email}`,
            "",
            `Відкрийте сторінку співробітників: ${new URL(`/${locale}/admin/employees`, getAppBaseUrl(request.url)).toString()}`,
          ].join("\n"),
        });
        await prisma.passwordResetEvent.create({
          data: {
            details: result.skipped ? "SMTP не налаштовано; лист не відправлено." : undefined,
            requestId: resetRequest.id,
            type: result.skipped ? "EMAIL_FAILED" : "EMAIL_SENT",
          },
        });
        if (result.skipped) {
          await prisma.passwordResetRequest.update({
            data: { emailError: "SMTP не налаштовано; сповіщення адміністратору не відправлено." },
            where: { id: resetRequest.id },
          });
          logPasswordResetEvent("admin_notification_skipped", { requestId: resetRequest.id, userId: user.id });
        }
      } catch (error) {
        const emailError = getErrorMessage(error);
        await prisma.$transaction([
          prisma.passwordResetRequest.update({
            data: { emailError },
            where: { id: resetRequest.id },
          }),
          prisma.passwordResetEvent.create({
            data: { details: emailError, requestId: resetRequest.id, type: "EMAIL_FAILED" },
          }),
        ]);
        logPasswordResetEvent("admin_notification_failed", { error, requestId: resetRequest.id, userId: user.id });
      }

      return NextResponse.json({ message: neutralMessage, ok: true });
    }

    const token = createPasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    await prisma.passwordResetToken.create({
      data: {
        expiresAt,
        requestId: resetRequest.id,
        tokenHash,
        userId: user.id,
      },
    });

    const resetUrl = new URL(`/${locale}/reset-password`, getAppBaseUrl(request.url));
    resetUrl.searchParams.set("token", token);

    try {
      const result = await sendMail({
        subject: "Відновлення доступу до AR Trans TK",
        text: [
          "Ви запросили відновлення пароля до панелі AR Trans TK.",
          "",
          `Щоб встановити новий пароль, перейдіть за посиланням: ${resetUrl.toString()}`,
          "",
          `Посилання дійсне ${PASSWORD_RESET_TTL_MINUTES} хвилин і може бути використане лише один раз.`,
          "Якщо ви не робили цей запит, просто проігноруйте лист.",
        ].join("\n"),
        to: email,
      });

      if (result.skipped) {
        throw new Error("SMTP не налаштовано; лист не відправлено.");
      }

      await prisma.passwordResetEvent.create({
        data: { requestId: resetRequest.id, type: "EMAIL_SENT" },
      });
      logPasswordResetEvent("reset_email_sent", { requestId: resetRequest.id, userId: user.id });
    } catch (error) {
      const emailError = getErrorMessage(error);
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { requestId: resetRequest.id } }),
        prisma.passwordResetRequest.update({
          data: { emailError, status: "FAILED" },
          where: { id: resetRequest.id },
        }),
        prisma.passwordResetEvent.create({
          data: { details: emailError, requestId: resetRequest.id, type: "EMAIL_FAILED" },
        }),
      ]);
      logPasswordResetEvent("reset_email_failed", { error, requestId: resetRequest.id, userId: user.id });
    }
  } catch (error) {
    logPasswordResetEvent("request_processing_failed", { error });
  }

  return NextResponse.json({ message: neutralMessage, ok: true });
}
