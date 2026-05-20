import { z } from "zod";

const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().email("Некоректний email").optional(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.date().optional(),
);

export const orderRequestSchema = z.object({
  name: z.string().trim().min(2, "Вкажіть ім'я"),
  phone: z.string().trim().min(7, "Вкажіть телефон"),
  email: optionalEmail,
  company: z.string().trim().optional(),
  origin: z.string().trim().min(2, "Вкажіть звідки"),
  destination: z.string().trim().min(2, "Вкажіть куди"),
  cargoType: z.string().trim().min(2, "Вкажіть тип вантажу"),
  temperatureMode: z.string().trim().min(1, "Вкажіть температурний режим"),
  weight: z.string().trim().min(1, "Вкажіть вагу"),
  comment: z.string().trim().optional(),
  preferredDate: optionalDate,
});

export const statusCheckSchema = z.object({
  requestNumber: z.string().trim().min(3),
  contact: z.string().trim().min(3),
});

export const contactSchema = z.object({
  contact: z.string().trim().min(3),
  time: z.string().trim().optional(),
});

export const questionSchema = z.object({
  contact: z.string().trim().min(3),
  question: z.string().trim().min(5),
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
export type StatusCheckInput = z.infer<typeof statusCheckSchema>;
