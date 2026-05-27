import Image from "next/image";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ConfirmSubmitButton, SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { deleteLogo, saveLogo } from "../actions";
import { SettingsContactsPanel } from "./SettingsContactsPanel";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

const defaults = {
  email: "sales@ar-trans-tk.ua",
  hours: "09:00 - 18:00",
  name: "Офіс",
  phone: "+380 (67) 120-45-88",
  recipientEmail: "sales@ar-trans-tk.ua",
  role: "Основні контактні дані",
};

const directorDefaults = {
  email: "ar-trans@ukr.net",
  messengers: [] as string[],
  name: "Ігор",
  phone: "+38 (067) 674 0411",
  role: "Директор ПП «АР-Транс»",
};

export default async function AdminSettingsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!(await requireAdmin())) redirect(`/${locale}/admin`);
  const query = await searchParams;
  const [rows, contacts] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.manager.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  const values = Object.fromEntries(rows.map(({ key, value }) => [key, value]));
  const director = {
    email: values["director.email"] || directorDefaults.email,
    messengers: values["director.messengers"]?.split(",").filter(Boolean) ?? directorDefaults.messengers,
    name: values["director.name"] || directorDefaults.name,
    phone: values["director.phone"] || directorDefaults.phone,
    role: values["director.role"] || directorDefaults.role,
  };
  const office = {
    email: values["contact.email"] || defaults.email,
    hours: values["contact.hours"] || defaults.hours,
    messengers: values["office.messengers"]?.split(",").filter(Boolean) ?? [],
    name: values["office.name"] || defaults.name,
    phone: values["contact.phones"]?.split(/\r?\n|,/)[0]?.trim() || defaults.phone,
    recipientEmail: values["contact.recipientEmail"] || defaults.recipientEmail,
    role: values["office.role"] || defaults.role,
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Налаштування</h2>
          <p className={styles.muted}>Логотип і контактні дані, які бачать відвідувачі сайту.</p>
        </div>
      </div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}

      <SettingsContactsPanel contacts={contacts} director={director} locale={locale} office={office} />

      <section className={styles.panel}>
        <h2>Логотип</h2>
        <p className={styles.muted}>Логотип використовується у хедері та футері сайту.</p>
        {values["brand.logo"] ? (
          <div className={styles.logoPreview}>
            <Image alt="Логотип компанії" height={80} src={values["brand.logo"]} width={180} />
          </div>
        ) : <p className={styles.empty}>Завантажений логотип відсутній.</p>}
        <form action={saveLogo} className={styles.contactForm}>
          <input name="locale" type="hidden" value={locale} />
          <label className={styles.fileLabel}>
            Завантажити або замінити логотип
            <input accept="image/*" name="brand.logo" type="file" />
          </label>
          <div className={styles.actions}>
            <SubmitButton>Зберегти логотип</SubmitButton>
            {values["brand.logo"] ? (
              <ConfirmSubmitButton action={deleteLogo} message="Видалити логотип із сайту?">Видалити логотип</ConfirmSubmitButton>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
