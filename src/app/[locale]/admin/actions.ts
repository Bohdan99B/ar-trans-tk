"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage, uploadImage, UploadImageError, type UploadedImage } from "@/lib/uploadImage";
import { adminContactSchema, adminOfficeContactSchema } from "@/lib/validators";

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

async function saveFileRegistry(uploaded: UploadedImage, entityType: string, entityId: string | null, userId?: string) {
  await prisma.file.upsert({
    create: {
      entityId,
      entityType,
      key: uploaded.key,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      url: uploaded.url,
      userId,
    },
    update: {
      entityId,
      entityType,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      url: uploaded.url,
      userId,
    },
    where: { key: uploaded.key },
  });
}

function uploadErrorMessage(error: unknown) {
  if (error instanceof UploadImageError) {
    return error.message;
  }

  return "Не вдалося завантажити фото. Перевірте Cloudinary налаштування";
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
  title: z.string().min(2, "Вкажіть реєстраційний номер"),
  volume: z.string().optional(),
});

export async function saveVehicle(data: FormData) {
  const locale = getLocale(data);
  const user = await requireStaff();
  if (!user) {
    redirect(adminPath(locale, "fleet", "error", "Доступ заборонено"));
  }

  const id = field(data, "id");
  if (user.role === "MANAGER") {
    if (!id) {
      redirect(adminPath(locale, "fleet", "error", "Менеджер не може додавати транспорт"));
    }
    await prisma.vehicle.update({
      data: {
        description: field(data, "description"),
        isActive: data.get("isActive") === "on",
      },
      where: { id },
    });
    revalidateAdmin(locale, "fleet");
    revalidatePath(`/${locale}/fleet`);
    revalidatePath(`/${locale}`);
    redirect(adminPath(locale, "fleet", "success", "Доступність транспорту оновлено"));
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

  const photo = data.get("photo");
  let uploaded: UploadedImage | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      uploaded = await uploadImage(photo, "fleet");
    } catch (error) {
      redirect(adminPath(locale, "fleet", "error", uploadErrorMessage(error)));
    }
  }

  const existing = id
    ? await prisma.vehicle.findUnique({ select: { photoPublicId: true }, where: { id } })
    : null;
  const shouldRemovePhoto = data.get("removePhoto") === "on";
  const update = {
    ...parsed.data,
    ...(uploaded ? { photoPublicId: uploaded.key, photoUrl: uploaded.url } : {}),
    ...(!uploaded && shouldRemovePhoto ? { photoPublicId: null, photoUrl: null } : {}),
  };
  if (id) {
    await prisma.vehicle.update({ data: update, where: { id } });
    if (uploaded) {
      await saveFileRegistry(uploaded, "fleet", id, user.id);
    }
  } else {
    const created = await prisma.vehicle.create({ data: update });
    if (uploaded) {
      await saveFileRegistry(uploaded, "fleet", created.id, user.id);
    }
  }
  if ((uploaded || shouldRemovePhoto) && existing?.photoPublicId && existing.photoPublicId !== uploaded?.key) {
    await deleteImage(existing.photoPublicId).catch(() => null);
    await prisma.file.deleteMany({ where: { key: existing.photoPublicId } });
  }
  revalidateAdmin(locale, "fleet");
  revalidatePath(`/${locale}/fleet`);
  revalidatePath(`/${locale}`);
  redirect(adminPath(locale, "fleet", "success", id ? "Транспорт оновлено" : "Транспорт створено"));
}

export async function deleteVehicle(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "fleet", "error", "Доступ заборонено"));
  }
  const id = idSchema.parse(field(data, "id"));
  const vehicle = await prisma.vehicle.findUnique({ select: { photoPublicId: true }, where: { id } });
  await prisma.vehicle.delete({ where: { id } });
  if (vehicle?.photoPublicId) {
    await deleteImage(vehicle.photoPublicId).catch(() => null);
    await prisma.file.deleteMany({ where: { key: vehicle.photoPublicId } });
  }
  revalidateAdmin(locale, "fleet");
  revalidatePath(`/${locale}/fleet`);
  redirect(adminPath(locale, "fleet", "success", "Транспорт видалено"));
}

export async function deleteVehiclePhoto(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "fleet", "error", "Доступ заборонено"));
  }
  const id = idSchema.parse(field(data, "id"));
  const vehicle = await prisma.vehicle.findUnique({
    select: { photoPublicId: true },
    where: { id },
  });
  if (!vehicle) {
    redirect(adminPath(locale, "fleet", "error", "Транспорт не знайдено"));
  }
  if (!vehicle.photoPublicId) {
    redirect(adminPath(locale, "fleet", "error", "Фото вже відсутнє"));
  }

  await prisma.vehicle.update({
    data: { photoPublicId: null, photoUrl: null },
    where: { id },
  });
  await deleteImage(vehicle.photoPublicId).catch(() => null);
  await prisma.file.deleteMany({ where: { key: vehicle.photoPublicId } });
  revalidateAdmin(locale, "fleet");
  revalidatePath(`/${locale}/fleet`);
  revalidatePath(`/${locale}`);
  redirect(adminPath(locale, "fleet", "success", "Фото видалено"));
}

const reviewSchema = z.object({
  author: z.string().min(2, "Вкажіть ім'я"),
  body: z.string().min(5, "Вкажіть текст відгуку"),
  company: z.string().optional(),
  moderationStatus: z.enum(["PENDING", "PUBLISHED", "HIDDEN"]),
});

function reviewResultPath(data: FormData, locale: string, type: "error" | "success", message: string) {
  const mode = field(data, "id") ? "edit" : "create";
  const params = new URLSearchParams({ mode, [type]: message });
  return `/${locale}/admin/reviews?${params.toString()}`;
}

export async function saveReview(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(reviewResultPath(data, locale, "error", "Доступ заборонено"));
  }
  const parsed = reviewSchema.safeParse({
    author: field(data, "author"),
    body: field(data, "body"),
    company: field(data, "company"),
    moderationStatus: field(data, "moderationStatus"),
  });
  if (!parsed.success) {
    redirect(reviewResultPath(data, locale, "error", "Перевірте поля відгуку"));
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
  redirect(reviewResultPath(data, locale, "success", id ? "Відгук оновлено" : "Відгук створено"));
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
  const updated = await prisma.vacancy.update({
    data: { ...parsed.data, isPublished: parsed.data.status === "ACTIVE" },
    where: { id: id.data },
  });
  revalidateAdmin(locale, "vacancies");
  revalidatePath(`/${locale}/vacancies`);
  revalidatePath(`/${locale}/cooperation`);
  return {
    success: "Вакансію збережено",
    vacancy: {
      description: updated.description,
      id: updated.id,
      isPublished: updated.isPublished,
      location: updated.location,
      requirements: updated.requirements,
      salary: updated.salary,
      status: updated.status,
      titleEn: updated.titleEn,
      titleUk: updated.titleUk,
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
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

function revalidatePublicContacts(locale: string) {
  revalidateAdmin(locale, "settings");
  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/contacts`);
}

const directorSchema = adminContactSchema;
const officeSchema = adminOfficeContactSchema;

function contactValues(data: FormData) {
  return {
    email: field(data, "email"),
    messengers: data.getAll("messengers").map(String),
    name: field(data, "name"),
    phone: field(data, "phone"),
    role: field(data, "role"),
  };
}

export async function saveOffice(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  const parsed = officeSchema.safeParse({
    ...contactValues(data),
    hours: field(data, "hours"),
    recipientEmail: field(data, "recipientEmail"),
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "settings", "error", "Перевірте дані офісу"));
  }
  const officeSettings = {
    "contact.email": parsed.data.email,
    "contact.hours": parsed.data.hours,
    "contact.phones": parsed.data.phone,
    "contact.recipientEmail": parsed.data.recipientEmail,
    "office.messengers": parsed.data.messengers.join(","),
    "office.name": parsed.data.name,
    "office.role": parsed.data.role,
  };
  await prisma.$transaction(
    Object.entries(officeSettings).map(([key, value]) =>
      prisma.siteSetting.upsert({ create: { key, value }, update: { value }, where: { key } }),
    ),
  );
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", "Картку офісу збережено"));
}

export async function saveLogo(data: FormData) {
  const locale = getLocale(data);
  const user = await requireAdmin();
  if (!user) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  const logo = data.get("brand.logo");
  if (logo instanceof File && logo.size > 0) {
    let result: UploadedImage;
    try {
      result = await uploadImage(logo, "logo");
    } catch (error) {
      redirect(adminPath(locale, "settings", "error", uploadErrorMessage(error)));
    }
    const previousLogoKey = await prisma.siteSetting.findUnique({ where: { key: "brand.logoKey" } });
    await prisma.$transaction([
      prisma.siteSetting.upsert({
        create: { key: "brand.logo", value: result.url },
        update: { value: result.url },
        where: { key: "brand.logo" },
      }),
      prisma.siteSetting.upsert({
        create: { key: "brand.logoKey", value: result.key },
        update: { value: result.key },
        where: { key: "brand.logoKey" },
      }),
      prisma.file.upsert({
        create: {
          entityId: null,
          entityType: "logo",
          key: result.key,
          mimeType: result.mimeType,
          size: result.size,
          url: result.url,
          userId: user.id,
        },
        update: {
          entityId: null,
          entityType: "logo",
          mimeType: result.mimeType,
          size: result.size,
          url: result.url,
          userId: user.id,
        },
        where: { key: result.key },
      }),
    ]);
    if (previousLogoKey?.value && previousLogoKey.value !== result.key) {
      await deleteImage(previousLogoKey.value).catch(() => null);
      await prisma.file.deleteMany({ where: { key: previousLogoKey.value } });
    }
  } else {
    redirect(adminPath(locale, "settings", "error", "Оберіть файл логотипу"));
  }
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", "Логотип збережено"));
}

export async function deleteLogo(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  const previousLogoKey = await prisma.siteSetting.findUnique({ where: { key: "brand.logoKey" } });
  await prisma.siteSetting.deleteMany({ where: { key: { in: ["brand.logo", "brand.logoKey"] } } });
  if (previousLogoKey?.value) {
    await deleteImage(previousLogoKey.value).catch(() => null);
    await prisma.file.deleteMany({ where: { key: previousLogoKey.value } });
  }
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", "Логотип видалено"));
}

export async function saveDirector(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  const parsed = directorSchema.safeParse(contactValues(data));
  if (!parsed.success) {
    redirect(adminPath(locale, "settings", "error", "Перевірте дані директора"));
  }
  const directorSettings = {
    "director.email": parsed.data.email,
    "director.messengers": parsed.data.messengers.join(","),
    "director.name": parsed.data.name,
    "director.phone": parsed.data.phone,
    "director.role": parsed.data.role,
  };
  await prisma.$transaction(
    Object.entries(directorSettings).map(([key, value]) =>
      prisma.siteSetting.upsert({ create: { key, value }, update: { value }, where: { key } }),
    ),
  );
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", "Контакт директора збережено"));
}

const managerSchema = directorSchema;

export async function saveManager(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  const parsed = managerSchema.safeParse(contactValues(data));
  if (!parsed.success) {
    redirect(adminPath(locale, "settings", "error", "Перевірте контактні дані"));
  }
  const id = field(data, "id");
  if (id) {
    await prisma.manager.update({ data: parsed.data, where: { id } });
  } else {
    await prisma.manager.create({ data: parsed.data });
  }
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", id ? "Контакт оновлено" : "Контакт додано"));
}

export async function deleteManager(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "settings", "error", "Доступ заборонено"));
  }
  await prisma.manager.delete({ where: { id: idSchema.parse(field(data, "id")) } });
  revalidatePublicContacts(locale);
  redirect(adminPath(locale, "settings", "success", "Контакт видалено"));
}

const contentSettingKeys = [
  "about.homeTitle",
  "about.homeText",
  "cta.title",
  "cta.text",
  "contact.phones",
  "contact.email",
  "contact.socials",
  "contact.address",
  "contact.hours",
  "seo.title",
  "seo.description",
  "seo.ogTitle",
  "seo.ogDescription",
  "seo.ogImage",
] as const;

const contentManagementEnabled = false;

export async function saveContentSettings(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "content", "error", "Доступ заборонено"));
  }
  if (!contentManagementEnabled) {
    redirect(adminPath(locale, "", "error", "Керування контентом тимчасово недоступне"));
  }
  await prisma.$transaction(
    contentSettingKeys.map((key) =>
      prisma.siteSetting.upsert({
        create: { key, value: field(data, key) },
        update: { value: field(data, key) },
        where: { key },
      }),
    ),
  );
  revalidateAdmin(locale, "content");
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/contacts`);
  redirect(adminPath(locale, "content", "success", "Контентні блоки збережено"));
}

const serviceSchema = z.object({
  bodyEn: z.string().min(2),
  bodyUk: z.string().min(2),
  isPublished: z.boolean(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug має містити лише латиницю, цифри та дефіс"),
  summaryEn: z.string().min(2),
  summaryUk: z.string().min(2),
  titleEn: z.string().min(2),
  titleUk: z.string().min(2),
});

export async function saveServiceContent(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "content", "error", "Доступ заборонено"));
  }
  if (!contentManagementEnabled) {
    redirect(adminPath(locale, "", "error", "Керування контентом тимчасово недоступне"));
  }
  const parsed = serviceSchema.safeParse({
    bodyEn: field(data, "bodyEn"),
    bodyUk: field(data, "bodyUk"),
    isPublished: data.get("isPublished") === "on",
    slug: field(data, "slug"),
    summaryEn: field(data, "summaryEn"),
    summaryUk: field(data, "summaryUk"),
    titleEn: field(data, "titleEn"),
    titleUk: field(data, "titleUk"),
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "content", "error", "Перевірте поля послуги та slug"));
  }
  const id = field(data, "id");
  if (id) {
    await prisma.service.update({ data: parsed.data, where: { id } });
  } else {
    await prisma.service.upsert({
      create: parsed.data,
      update: parsed.data,
      where: { slug: parsed.data.slug },
    });
  }
  revalidateAdmin(locale, "content");
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/services`);
  redirect(adminPath(locale, "content", "success", "Послугу збережено"));
}

const routeSchema = z.object({
  country: z.string().min(2),
  destination: z.string().min(2),
  direction: z.string().min(2),
  isActive: z.boolean(),
  origin: z.string().min(2),
});

export async function saveGeographyRoute(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "content", "error", "Доступ заборонено"));
  }
  if (!contentManagementEnabled) {
    redirect(adminPath(locale, "", "error", "Керування контентом тимчасово недоступне"));
  }
  const parsed = routeSchema.safeParse({
    country: field(data, "country"),
    destination: field(data, "destination"),
    direction: field(data, "direction"),
    isActive: data.get("isActive") === "on",
    origin: field(data, "origin"),
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "content", "error", "Перевірте поля маршруту"));
  }
  const id = field(data, "id");
  if (id) {
    await prisma.geographyRoute.update({ data: parsed.data, where: { id } });
  } else {
    await prisma.geographyRoute.create({ data: parsed.data });
  }
  revalidateAdmin(locale, "content");
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/geography`);
  redirect(adminPath(locale, "content", "success", "Маршрут збережено"));
}

const faqSchema = z.object({
  answerEn: z.string().min(2),
  answerUk: z.string().min(2),
  isPublished: z.boolean(),
  questionEn: z.string().min(2),
  questionUk: z.string().min(2),
  sortOrder: z.coerce.number().int(),
});

export async function saveFaqContent(data: FormData) {
  const locale = getLocale(data);
  if (!(await requireAdmin())) {
    redirect(adminPath(locale, "content", "error", "Доступ заборонено"));
  }
  if (!contentManagementEnabled) {
    redirect(adminPath(locale, "", "error", "Керування контентом тимчасово недоступне"));
  }
  const parsed = faqSchema.safeParse({
    answerEn: field(data, "answerEn"),
    answerUk: field(data, "answerUk"),
    isPublished: data.get("isPublished") === "on",
    questionEn: field(data, "questionEn"),
    questionUk: field(data, "questionUk"),
    sortOrder: field(data, "sortOrder") || "0",
  });
  if (!parsed.success) {
    redirect(adminPath(locale, "content", "error", "Перевірте поля FAQ"));
  }
  const id = field(data, "id");
  if (id) {
    await prisma.faqItem.update({ data: parsed.data, where: { id } });
  } else {
    await prisma.faqItem.create({ data: parsed.data });
  }
  revalidateAdmin(locale, "content");
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/faq`);
  redirect(adminPath(locale, "content", "success", "FAQ збережено"));
}
