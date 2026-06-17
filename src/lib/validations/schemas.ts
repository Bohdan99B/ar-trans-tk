import { z } from "zod";

export const validationMessages = {
  adminPhone: "Введіть номер у форматі +38 (0XX) XXX XXXX.",
  contact: "Введіть коректний телефон або email.",
  email: "Введіть коректний email.",
  name: "Введіть ім’я.",
  phone: "Введіть коректний номер телефону.",
  question: "Напишіть ваше питання.",
} as const;

const namePattern = /^[A-Za-zА-Яа-яІіЇїЄєҐґ\s'’-]+$/u;
const adminPhonePattern = /^\+38 \(0\d{2}\) \d{3} \d{4}$/;
const unsafeTextPattern = /[<>]|&(?:lt|gt);|<\/?\s*script\b/iu;
const controlCharacterPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const unsafeTextMessage = "Не використовуйте HTML-теги або службові символи.";

function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function hasMeaningfulContent(value: string) {
  return /[\p{L}\p{N}]/u.test(value);
}

function isSafeHumanText(value: string) {
  return !unsafeTextPattern.test(value) && !controlCharacterPattern.test(value);
}

export function isValidEmail(value: string) {
  return z.string().trim().email().safeParse(value).success;
}

export function isValidUkrainianPhone(value: string) {
  const trimmed = value.trim();
  const compact = trimmed.replace(/[()\s-]/g, "");

  return /^\+380\d{9}$/.test(compact) || /^0\d{9}$/.test(compact);
}

export function isValidAdminPhone(value: string) {
  return adminPhonePattern.test(value.trim());
}

export function maskAdminPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^38/, "").slice(0, 10);
  const operator = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 10);
  let masked = "+38";

  if (operator) masked += ` (${operator}`;
  if (operator.length === 3) masked += ")";
  if (first) masked += ` ${first}`;
  if (second) masked += ` ${second}`;

  return masked;
}

const requiredName = z.string()
  .trim()
  .min(2, validationMessages.name)
  .max(80, validationMessages.name)
  .regex(namePattern, validationMessages.name)
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine((value) => !/^\d+$/.test(value), validationMessages.name);

const requiredCity = z.string()
  .trim()
  .min(2, "Вкажіть місто.")
  .max(80, "Вкажіть місто.")
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine(hasMeaningfulContent, "Вкажіть місто.")
  .refine((value) => !/^\d+$/.test(value), "Вкажіть місто.");

export const requiredText = (message: string, max = 100) => z.string()
  .trim()
  .min(2, message)
  .max(max, message)
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine(hasMeaningfulContent, message);

export const optionalText = (message: string, max = 100) => z.preprocess(
  emptyToUndefined,
  requiredText(message, max).optional(),
);

export const optionalTextarea = z.preprocess(
  emptyToUndefined,
  z.string()
    .trim()
    .max(1000, "Коментар має містити не більше 1000 символів.")
    .refine(isSafeHumanText, unsafeTextMessage)
    .refine(hasMeaningfulContent, "Коментар має містити змістовний текст.")
    .optional(),
);

export const requiredTextarea = (message: string, max = 1000) => z.string()
  .trim()
  .min(5, message)
  .max(max, message)
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine(hasMeaningfulContent, message);

const phone = z.string().trim().refine(isValidUkrainianPhone, validationMessages.phone);
const adminPhone = z.string().trim().refine(isValidAdminPhone, validationMessages.adminPhone);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email(validationMessages.email).optional(),
);

const requiredEmail = z.string().trim().email(validationMessages.email);

const phoneOrEmail = z.string()
  .trim()
  .refine((value) => isValidUkrainianPhone(value) || isValidEmail(value), validationMessages.contact);

const optionalTime = z.preprocess(
  emptyToUndefined,
  z.string()
    .trim()
    .max(100, "Вкажіть коректний зручний час.")
    .refine(hasMeaningfulContent, "Вкажіть коректний зручний час.")
    .optional(),
);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional(),
);

const location = (message: string) => z.string()
  .trim()
  .min(2, message)
  .max(120, message)
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine(hasMeaningfulContent, message);

const temperatureMode = z.string()
  .trim()
  .min(1, "Вкажіть коректний температурний режим.")
  .max(80, "Вкажіть коректний температурний режим.")
  .refine(isSafeHumanText, unsafeTextMessage)
  .refine((value) => /\d/.test(value), "Вкажіть коректний температурний режим.");

const weight = z.string()
  .trim()
  .min(1, "Вкажіть вагу вантажу.")
  .max(80, "Вкажіть вагу вантажу.")
  .regex(/^[0-9\s.,кКгГтТ]+$/u, "Вкажіть вагу вантажу.")
  .refine((value) => /\d/.test(value), "Вкажіть вагу вантажу.");

export const orderRequestSchema = z.object({
  name: requiredName,
  phone,
  email: optionalEmail,
  company: optionalText("Вкажіть коректну назву компанії."),
  origin: location("Вкажіть місто або країну відправлення."),
  destination: location("Вкажіть місто або країну доставки."),
  cargoType: requiredText("Вкажіть тип вантажу.", 120),
  temperatureMode,
  weight,
  comment: optionalTextarea,
  preferredDate: optionalDate,
});

export const statusCheckSchema = z.object({
  requestNumber: z.string().trim().min(3),
  contact: z.string().trim().min(3),
});

export const contactSchema = z.object({
  contact: phoneOrEmail,
  time: optionalTime,
});

export const questionSchema = z.object({
  contact: phoneOrEmail,
  question: requiredTextarea(validationMessages.question),
});

export const vacancyApplicationSchema = z.object({
  vacancyId: z.string().trim().min(1),
  name: requiredName,
  phone,
  email: optionalEmail,
  comment: optionalTextarea,
});

export const cooperationApplicationSchema = z.object({
  vacancyId: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).optional(),
  ),
  customDirection: z.preprocess(
    emptyToUndefined,
    requiredText("Вкажіть напрям співпраці", 120).optional(),
  ),
  name: requiredName,
  phone,
  email: requiredEmail,
  city: requiredCity,
  comment: optionalTextarea,
}).refine((value) => Boolean(value.vacancyId || value.customDirection), {
  message: "Оберіть напрям співпраці",
  path: ["vacancyId"],
});

export const adminContactSchema = z.object({
  email: requiredEmail,
  messengers: z.array(z.enum(["Telegram", "Viber", "WhatsApp"])),
  name: requiredName,
  phone: adminPhone,
  role: requiredText("Вкажіть посаду.", 120),
});

export const adminOfficeContactSchema = adminContactSchema.extend({
  hours: requiredText("Вкажіть графік роботи.", 100),
  recipientEmail: requiredEmail,
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
export type StatusCheckInput = z.infer<typeof statusCheckSchema>;
