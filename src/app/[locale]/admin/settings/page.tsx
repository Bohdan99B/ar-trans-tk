import Image from "next/image";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { saveSettings } from "../actions";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminSettingsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!(await requireAdmin())) redirect(`/${locale}/admin/requests`);
  const query = await searchParams;
  const values = Object.fromEntries((await prisma.siteSetting.findMany()).map(({ key, value }) => [key, value]));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><div><h2>Налаштування</h2><p className={styles.muted}>Контакти, пошта, SEO та бренд сайту.</p></div></div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}
      <form action={saveSettings} className={styles.form}>
        <input name="locale" type="hidden" value={locale} />
        <h2>Контактні дані</h2>
        <div className={styles.fields}>
          <Setting label="Телефони" name="contact.phones" value={values["contact.phones"]} />
          <Setting label="Публічний email" name="contact.email" type="email" value={values["contact.email"]} />
          <Setting label="Email для заявок" name="contact.recipientEmail" type="email" value={values["contact.recipientEmail"]} />
          <Setting label="Соцмережі" name="contact.socials" value={values["contact.socials"]} />
          <Setting label="Адреса" name="contact.address" value={values["contact.address"]} />
          <Setting label="Графік роботи" name="contact.hours" value={values["contact.hours"]} />
        </div>
        <h2>SMTP</h2>
        <div className={styles.fields}>
          <Setting label="SMTP host" name="smtp.host" value={values["smtp.host"]} />
          <Setting label="SMTP port" name="smtp.port" type="number" value={values["smtp.port"] ?? "587"} />
          <Setting label="SMTP user" name="smtp.user" value={values["smtp.user"]} />
          <Setting label="SMTP password (залиште порожнім, щоб не змінювати)" name="smtp.password" type="password" />
          <Setting label="Email from" name="smtp.from" type="email" value={values["smtp.from"]} />
          <label className={styles.checkbox}><input defaultChecked={values["smtp.secure"] === "true"} name="smtp.secure" type="checkbox" /> SMTP secure</label>
        </div>
        <h2>SEO defaults</h2>
        <div className={styles.fields}>
          <Setting label="Default title" name="seo.title" value={values["seo.title"]} />
          <Setting label="Default description" name="seo.description" value={values["seo.description"]} />
          <Setting label="OpenGraph title" name="seo.ogTitle" value={values["seo.ogTitle"]} />
          <Setting label="OpenGraph description" name="seo.ogDescription" value={values["seo.ogDescription"]} />
          <Setting label="OpenGraph image URL" name="seo.ogImage" value={values["seo.ogImage"]} />
        </div>
        <h2>Логотип</h2>
        {values["brand.logo"] ? <Image alt="Логотип компанії" height={80} src={values["brand.logo"]} width={180} /> : null}
        <label>Завантажити/замінити логотип<input accept="image/*" name="brand.logo" type="file" /></label>
        <SubmitButton>Зберегти налаштування</SubmitButton>
      </form>
    </div>
  );
}

function Setting({ label, name, type = "text", value }: { label: string; name: string; type?: string; value?: string }) {
  return <label>{label}<input defaultValue={value ?? ""} name={name} type={type} /></label>;
}
