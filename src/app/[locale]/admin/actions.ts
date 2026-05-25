"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin, requireStaff } from "@/lib/auth";
import { uploadCmsFile } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const localeSchema = z.enum(["uk", "en"]);
const idSchema = z.string().trim().min(1);

function field(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

function adminPath(locale: string, section: string, type: "error" | "success", message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `/${locale}/admin/${section}?${params.toString()}`;
}

function vacancyResultPath(data: FormData, locale: string, type: "error" | "success", message: string) {
  const params = new URLSearchParams({ [type]: message });
  for (const key of ["vacancyPage", "generalPage"]) {
    const value = field(data, key);
    if (value) params.set(key, value);
  }
  if (type === "error") {
    const id = field(data, "id");
    params.set(id ? "editVacancyId" : "create", id || "open");
  }
  return `/${locale}/admin/vacancies?${params.toString()}`;
}

function getLocale(data: FormData) {
  return localeSchema.parse(field(data, "locale") || "uk");
}

function revalidateAdmin(locale: string, section: string) {
  revalidatePath(`/${locale}/admin/${section}`);
  revalidatePath(`/${locale}/admin`);
}

function requestResultPath(data: FormData, locale: string, type: "error" | "success", message: string) {
  const view = field(data, "view") === "questions" ? "questions" : "applications";
  const page = /^\d+$/.test(field(data, "page")) ? field(data, "page") : "1";
  const params = new URLSearchParams({ page, view, [type]: message });
  const statusFilter = field(data, "statusFilter");
  if (statusFilter) params.set("status", statusFilter);
  const selectedId = field(data, "selectedId");
  if (selectedId) params.set("selectedId", selectedId);
  return `/${locale}/admin/requests?${params.toString()}`;
}

export async function updateRequestStatus(data: FormData) {
  const locale = getLocale(data);
  const user = await requireStaff();
  if (!user) {
    redirect(requestResultPath(data, locale, "error", "Доступ заборонено"));
  }

  const id = idSchema.parse(field(data, "id"));
  const statusId = idSchema.parse(field(data, "statusId"));
  await prisma.transportRequest.update({ data: { statusId }, where: { id } });
  revalidateAdmin(locale, "requests");
  redirect(requestResultPath(data, locale, "success", "Статус оновлено"));
}

export async function updateCooperationApplicationStatus(data: FormData) {
  const locale = getLocale(data);
  const params = new URLSearchParams({ success: "Статус оновлено" });
  for (const key of ["vacancyPage", "generalPage", "selectedVacancyId", "candidatePage"]) {
    const value = field(data, key);
    if (value) params.set(key, value);
  }
  const fragment = field(data, "fragment");
  const returnPath = `/${locale}/admin/vacancies?${params.toString()}${fragment ? `#${fragment}` : ""}`;
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "vacancies", "error", "Доступ заборонено"));
  }
  const status = z.enum(["NEW", "CONTACTED", "ARCHIVED"]).parse(field(data, "status"));
  await prisma.cooperationApplication.update({
    data: { status },
    where: { id: idSchema.parse(field(data, "id")) },
  });
  revalidateAdmin(locale, "vacancies");
  redirect(returnPath);
}

const vehicleSchema = z.object({
  brand: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  payloadTonnes: z.coerce.number().positive(),
  temperatureFrom: z.coerce.number(),
  temperatureTo: z.coerce.number(),
  title: z.string().min(2, "Вкажіть назву"),
  volume: z.string().optional(),
});

export async function saveVehicle(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "fleet", "error", "Доступ заборонено"));
  }

  const parsed = vehicleSchema.safeParse({
    brand: field(data, "brand"),
    description: field(data, "description"),
    isActive: data.get("isActive") === "on",
    payloadTonnes: field(data, "payloadTonnes"),
    temperatureFrom: field(data, "temperatureFrom"),
    temperatureTo: field(data, "temperatureTo"),
    title: field(data, "title"),
    volume: field(data, "volume"),
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "fleet", "error", "Перевірте поля транспорту"));
  }

  const id = field(data, "id");
  const photo = data.get("photo");
  let uploaded: { public_id: string; secure_url: string } | null = null;
  if (photo instanceof File && photo.size > 0) {
    uploaded = await uploadCmsFile(photo, "fleet");
  }
  const update = {
    ...parsed.data,
    ...(uploaded ? { photoPublicId: uploaded.public_id, photoUrl: uploaded.secure_url } : {}),
  };
  if (id) {
    await prisma.vehicle.update({ data: update, where: { id } });
  } else {
    await prisma.vehicle.create({ data: update });
  }
  revalidateAdmin(locale, "fleet");
  revalidatePath(`/${locale}/fleet`);
  redirect(adminPath(locale, "fleet", "success", id ? "Транспорт оновлено" : "Транспорт створено"));
}

export async function deleteVehicle(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "fleet", "error", "Доступ заборонено"));
  }
  await prisma.vehicle.delete({ where: { id: idSchema.parse(field(data, "id")) } });
  revalidateAdmin(locale, "fleet");
  revalidatePath(`/${locale}/fleet`);
  redirect(adminPath(locale, "fleet", "success", "Транспорт видалено"));
}

const reviewSchema = z.object({
  author: z.string().min(2, "Вкажіть ім'я"),
  body: z.string().min(5, "Вкажіть текст відгуку"),
  company: z.string().optional(),
  moderationStatus: z.enum(["PENDING", "PUBLISHED", "HIDDEN"]),
});

export async function saveReview(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "reviews", "error", "Доступ заборонено"));
  }
  const parsed = reviewSchema.safeParse({
    author: field(data, "author"),
    body: field(data, "body"),
    company: field(data, "company"),
    moderationStatus: field(data, "moderationStatus"),
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "reviews", "error", "Перевірте поля відгуку"));
  }
  const id = field(data, "id");
  const values = { ...parsed.data, isPublished: parsed.data.moderationStatus === "PUBLISHED" };
  if (id) {
    await prisma.review.update({ data: values, where: { id } });
  } else {
    await prisma.review.create({ data: values });
  }
  revalidateAdmin(locale, "reviews");
  revalidatePath(`/${locale}/reviews`);
  revalidatePath(`/${locale}`);
  redirect(adminPath(locale, "reviews", "success", "Відгук збережено"));
}

export async function deleteReview(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "reviews", "error", "Доступ заборонено"));
  }
  await prisma.review.delete({ where: { id: idSchema.parse(field(data, "id")) } });
  revalidateAdmin(locale, "reviews");
  revalidatePath(`/${locale}/reviews`);
  revalidatePath(`/${locale}`);
  redirect(adminPath(locale, "reviews", "success", "Відгук видалено"));
}

const vacancySchema = z.object({
  description: z.string().min(5, "Вкажіть опис"),
  location: z.string().min(2, "Вкажіть локацію"),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  titleEn: z.string().min(2, "Вкажіть назву англійською"),
  titleUk: z.string().min(2, "Вкажіть назву"),
});

function parseVacancy(data: FormData) {
  return vacancySchema.safeParse({
    description: field(data, "description"),
    location: field(data, "location"),
    requirements: field(data, "requirements"),
    salary: field(data, "salary"),
    status: field(data, "status"),
    titleEn: field(data, "titleEn"),
    titleUk: field(data, "titleUk"),
  });
}

export async function saveVacancy(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "vacancies", "error", "Доступ заборонено"));
  }
  const parsed = parseVacancy(data);
  if (!parsed.success) {
    redirect(vacancyResultPath(data, locale, "error", "Перевірте поля вакансії"));
  }
  const id = field(data, "id");
  const values = { ...parsed.data, isPublished: parsed.data.status === "ACTIVE" };
  if (id) {
    await prisma.vacancy.update({ data: values, where: { id } });
  } else {
    await prisma.vacancy.create({ data: values });
  }
  revalidateAdmin(locale, "vacancies");
  revalidatePath(`/${locale}/vacancies`);
  revalidatePath(`/${locale}/cooperation`);
  redirect(vacancyResultPath(data, locale, "success", "Вакансію збережено"));
}

export async function saveVacancyInline(
  _previousState: { error?: string; success?: string } | undefined,
  data: FormData,
) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    return { error: "Доступ заборонено" };
  }
  const parsed = parseVacancy(data);
  if (!parsed.success) {
    return { error: "Перевірте поля вакансії" };
  }
  const id = idSchema.safeParse(field(data, "id"));
  if (!id.success) {
    return { error: "Вакансію не знайдено" };
  }
  await prisma.vacancy.update({
    data: { ...parsed.data, isPublished: parsed.data.status === "ACTIVE" },
    where: { id: id.data },
  });
  revalidateAdmin(locale, "vacancies");
  revalidatePath(`/${locale}/vacancies`);
  revalidatePath(`/${locale}/cooperation`);
  return { success: "Вакансію збережено" };
}

export async function deleteVacancy(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "vacancies", "error", "Доступ заборонено"));
  }
  const id = idSchema.parse(field(data, "id"));
  const vacancy = await prisma.vacancy.findUniqueOrThrow({ select: { titleUk: true }, where: { id } });
  await prisma.$transaction([
    prisma.cooperationApplication.updateMany({
      data: { customDirection: vacancy.titleUk, vacancyId: null },
      where: { vacancyId: id },
    }),
    prisma.vacancy.delete({ where: { id } }),
  ]);
  revalidateAdmin(locale, "vacancies");
  revalidatePath(`/${locale}/cooperation`);
  redirect(adminPath(locale, "vacancies", "success", "Вакансію видалено"));
}

const settingKeys = [
  "contact.phones",
  "contact.email",
  "contact.recipientEmail",
  "contact.socials",
  "contact.address",
  "contact.hours",
  "smtp.host",
  "smtp.port",
  "smtp.secure",
  "smtp.user",
  "smtp.from",
  "seo.title",
  "seo.description",
  "seo.ogTitle",
  "seo.ogDescription",
  "seo.ogImage",
] as const;

export async function saveSettings(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  await prisma.$transaction(
    settingKeys.map((key) =>
      prisma.siteSetting.upsert({
        create: { key, value: key === "smtp.secure" ? String(data.get(key) === "on") : field(data, key) },
        update: { value: key === "smtp.secure" ? String(data.get(key) === "on") : field(data, key) },
        where: { key },
      }),
    ),
  );
  const password = field(data, "smtp.password");
  if (password) {
    await prisma.siteSetting.upsert({
      create: { key: "smtp.password", value: password },
      update: { value: password },
      where: { key: "smtp.password" },
    });
  }
  const logo = data.get("brand.logo");
  if (logo instanceof File && logo.size > 0) {
    const result = await uploadCmsFile(logo, "brand", "logo");
    await prisma.siteSetting.upsert({
      create: { key: "brand.logo", value: result.secure_url },
      update: { value: result.secure_url },
      where: { key: "brand.logo" },
    });
  }
  revalidateAdmin(locale, "settings");
  redirect(adminPath(locale, "settings", "success", "Налаштування збережено"));
}
