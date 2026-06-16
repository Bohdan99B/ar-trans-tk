import { faqs as defaultFaqs, routes as defaultRoutes, services as defaultServices } from "./static-content";
import { prisma } from "@/lib/prisma";

export const messengerOptions = ["Telegram", "Viber", "WhatsApp"] as const;

export type PublicContact = {
  email: string;
  hours?: string;
  messengers: string[];
  name: string;
  phone: string;
  role: string;
};

const officeDefaults = {
  email: "sales@ar-trans-tk.ua",
  hours: "09:00 - 18:00",
  name: "Офіс",
  phone: "+380 (67) 120-45-88",
  role: "Основні контактні дані",
};

const directorDefaults = {
  email: "ar-trans@ukr.net",
  name: "Ігор",
  phone: "+38 (067) 674 0411",
  role: "Директор ПП «АР-Транс»",
};

export async function getPublicContacts() {
  const [rows, managers] = await Promise.all([
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "contact.phones",
            "contact.email",
            "contact.hours",
            "office.name",
            "office.role",
            "office.messengers",
            "director.name",
            "director.role",
            "director.phone",
            "director.email",
            "director.messengers",
          ],
        },
      },
    }),
    prisma.manager.findMany({ orderBy: { createdAt: "asc" }, where: { isActive: true } }),
  ]);
  const settings = Object.fromEntries(rows.map(({ key, value }) => [key, value]));
  const office: PublicContact = {
    email: settings["contact.email"] || officeDefaults.email,
    hours: settings["contact.hours"] || officeDefaults.hours,
    messengers: parseMessengers(settings["office.messengers"]),
    name: settings["office.name"] || officeDefaults.name,
    phone: settings["contact.phones"]?.split(/\r?\n|,/)[0]?.trim() || officeDefaults.phone,
    role: settings["office.role"] || officeDefaults.role,
  };
  const director: PublicContact = {
    email: settings["director.email"] || directorDefaults.email,
    messengers: parseMessengers(settings["director.messengers"]),
    name: settings["director.name"] || directorDefaults.name,
    phone: settings["director.phone"] || directorDefaults.phone,
    role: settings["director.role"] || directorDefaults.role,
  };
  const additionalContacts: PublicContact[] = managers.map((manager) => ({
    email: manager.email,
    messengers: manager.messengers,
    name: manager.name,
    phone: manager.phone,
    role: manager.role,
  }));

  return { additionalContacts, director, office };
}

function parseMessengers(value?: string) {
  if (!value) return [];
  return value.split(",").filter((item) => messengerOptions.includes(item as (typeof messengerOptions)[number]));
}

export async function getSiteServices(locale: string) {
  const rows = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (rows.length === 0) {
    return defaultServices.map((service) => ({
      bullets: service.bulletsUk,
      icon: service.icon,
      slug: service.slug,
      summary: locale === "en" ? service.summaryEn : service.summaryUk,
      title: locale === "en" ? service.titleEn : service.titleUk,
    }));
  }

  return rows.filter((service) => service.isPublished).map((service) => {
    const fallback = defaultServices.find((item) => item.slug === service.slug);
    return {
      bullets: fallback?.bulletsUk ?? [],
      icon: fallback?.icon ?? "SRV",
      slug: service.slug,
      summary: locale === "en" ? service.summaryEn : service.summaryUk,
      title: locale === "en" ? service.titleEn : service.titleUk,
    };
  });
}

export async function getSiteRoutes() {
  const rows = await prisma.geographyRoute.findMany({
    orderBy: { createdAt: "asc" },
  });

  return rows.length
    ? rows.filter((route) => route.isActive).map(({ country, destination, direction }) => ({ country, destination, direction }))
    : defaultRoutes;
}

export async function getSiteFaqs(locale: string) {
  const rows = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (rows.length === 0) {
    return defaultFaqs;
  }

  return rows.filter((item) => item.isPublished).map((item) => ({
    a: locale === "en" ? item.answerEn : item.answerUk,
    href: "contacts",
    q: locale === "en" ? item.questionEn : item.questionUk,
  }));
}

export async function getContentSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: ["about.homeTitle", "about.homeText", "cta.title", "cta.text"],
      },
    },
  });

  return Object.fromEntries(rows.map(({ key, value }) => [key, value]));
}
