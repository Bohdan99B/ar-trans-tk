import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { saveContentSettings, saveFaqContent, saveGeographyRoute, saveServiceContent } from "../actions";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminContentPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!(await requireAdmin())) redirect(`/${locale}/admin`);
  const query = await searchParams;
  const [settings, services, routes, faqs] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.service.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.geographyRoute.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Контент сайту</h2>
          <p className={styles.muted}>Основні тексти, публічні контакти, SEO, послуги, географія та FAQ.</p>
        </div>
      </div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}

      <form action={saveContentSettings} className={styles.form}>
        <input name="locale" type="hidden" value={locale} />
        <h2>Про компанію та CTA-блок</h2>
        <div className={styles.fields}>
          <Setting label="Заголовок блоку «Про компанію» на головній" name="about.homeTitle" value={values["about.homeTitle"]} />
          <Setting area label="Текст блоку «Про компанію» на головній" name="about.homeText" value={values["about.homeText"]} />
          <Setting label="Заголовок CTA" name="cta.title" value={values["cta.title"]} />
          <Setting area label="Текст CTA" name="cta.text" value={values["cta.text"]} />
        </div>
        <h2>Контакти</h2>
        <div className={styles.fields}>
          <Setting area label="Телефони (по одному в рядку)" name="contact.phones" value={values["contact.phones"]} />
          <Setting label="Публічний email" name="contact.email" type="email" value={values["contact.email"]} />
          <Setting label="Соцмережі" name="contact.socials" value={values["contact.socials"]} />
          <Setting label="Адреса" name="contact.address" value={values["contact.address"]} />
          <Setting label="Графік роботи" name="contact.hours" value={values["contact.hours"]} />
        </div>
        <h2>SEO-дані сторінок</h2>
        <p className={styles.muted}>Значення використовуються як загальні metadata defaults для локалізованих сторінок.</p>
        <div className={styles.fields}>
          <Setting label="Типовий заголовок" name="seo.title" value={values["seo.title"]} />
          <Setting area label="Типовий опис" name="seo.description" value={values["seo.description"]} />
          <Setting label="Заголовок OpenGraph" name="seo.ogTitle" value={values["seo.ogTitle"]} />
          <Setting area label="Опис OpenGraph" name="seo.ogDescription" value={values["seo.ogDescription"]} />
          <Setting label="URL зображення OpenGraph" name="seo.ogImage" value={values["seo.ogImage"]} />
        </div>
        <SubmitButton>Зберегти текстовий контент</SubmitButton>
      </form>

      <section className={styles.panel}>
        <h2>Послуги</h2>
        <p className={styles.muted}>Опубліковані позиції відображаються у блоці послуг і на сторінці послуг.</p>
        <ServiceForm locale={locale} />
        <div className={styles.cards}>
          {services.map((service) => <ServiceForm key={service.id} locale={locale} service={service} />)}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Географія</h2>
        <p className={styles.muted}>Активні маршрути формують списки напрямків на сайті.</p>
        <RouteForm locale={locale} />
        <div className={styles.cards}>
          {routes.map((route) => <RouteForm key={route.id} locale={locale} route={route} />)}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>FAQ-блоки</h2>
        <FaqForm locale={locale} />
        <div className={styles.cards}>
          {faqs.map((faq) => <FaqForm faq={faq} key={faq.id} locale={locale} />)}
        </div>
      </section>
    </div>
  );
}

function Setting({ area = false, label, name, type = "text", value }: { area?: boolean; label: string; name: string; type?: string; value?: string }) {
  return (
    <label>
      {label}
      {area ? <textarea defaultValue={value ?? ""} name={name} /> : <input defaultValue={value ?? ""} name={name} type={type} />}
    </label>
  );
}

type ServiceValue = {
  bodyEn: string;
  bodyUk: string;
  id: string;
  isPublished: boolean;
  slug: string;
  summaryEn: string;
  summaryUk: string;
  titleEn: string;
  titleUk: string;
};

function ServiceForm({ locale, service }: { locale: string; service?: ServiceValue }) {
  return (
    <form action={saveServiceContent} className={styles.form}>
      <h3>{service ? service.titleUk : "Додати послугу"}</h3>
      <input name="locale" type="hidden" value={locale} />
      {service ? <input name="id" type="hidden" value={service.id} /> : null}
      <div className={styles.fields}>
        <Setting label="URL-ідентифікатор" name="slug" value={service?.slug} />
        <Setting label="Назва українською" name="titleUk" value={service?.titleUk} />
        <Setting label="Назва англійською" name="titleEn" value={service?.titleEn} />
        <Setting area label="Анонс українською" name="summaryUk" value={service?.summaryUk} />
        <Setting area label="Анонс англійською" name="summaryEn" value={service?.summaryEn} />
        <Setting area label="Повний текст українською" name="bodyUk" value={service?.bodyUk} />
        <Setting area label="Повний текст англійською" name="bodyEn" value={service?.bodyEn} />
        <label className={styles.checkbox}><input defaultChecked={service?.isPublished ?? true} name="isPublished" type="checkbox" /> Опубліковано</label>
      </div>
      <SubmitButton>{service ? "Оновити послугу" : "Додати послугу"}</SubmitButton>
    </form>
  );
}

type RouteValue = {
  country: string;
  destination: string;
  direction: string;
  id: string;
  isActive: boolean;
  origin: string;
};

function RouteForm({ locale, route }: { locale: string; route?: RouteValue }) {
  return (
    <form action={saveGeographyRoute} className={styles.form}>
      <h3>{route ? route.country : "Додати маршрут"}</h3>
      <input name="locale" type="hidden" value={locale} />
      {route ? <input name="id" type="hidden" value={route.id} /> : null}
      <div className={styles.fields}>
        <Setting label="Звідки" name="origin" value={route?.origin ?? "Україна"} />
        <Setting label="Країна / напрямок" name="country" value={route?.country} />
        <Setting area label="Опис напрямку" name="destination" value={route?.destination} />
        <Setting label="Код напрямку" name="direction" value={route?.direction} />
        <label className={styles.checkbox}><input defaultChecked={route?.isActive ?? true} name="isActive" type="checkbox" /> Активний</label>
      </div>
      <SubmitButton>{route ? "Оновити маршрут" : "Додати маршрут"}</SubmitButton>
    </form>
  );
}

type FaqValue = {
  answerEn: string;
  answerUk: string;
  id: string;
  isPublished: boolean;
  questionEn: string;
  questionUk: string;
  sortOrder: number;
};

function FaqForm({ faq, locale }: { faq?: FaqValue; locale: string }) {
  return (
    <form action={saveFaqContent} className={styles.form}>
      <h3>{faq ? faq.questionUk : "Додати FAQ"}</h3>
      <input name="locale" type="hidden" value={locale} />
      {faq ? <input name="id" type="hidden" value={faq.id} /> : null}
      <div className={styles.fields}>
        <Setting label="Питання українською" name="questionUk" value={faq?.questionUk} />
        <Setting label="Питання англійською" name="questionEn" value={faq?.questionEn} />
        <Setting area label="Відповідь українською" name="answerUk" value={faq?.answerUk} />
        <Setting area label="Відповідь англійською" name="answerEn" value={faq?.answerEn} />
        <Setting label="Порядок" name="sortOrder" type="number" value={String(faq?.sortOrder ?? 0)} />
        <label className={styles.checkbox}><input defaultChecked={faq?.isPublished ?? true} name="isPublished" type="checkbox" /> Опубліковано</label>
      </div>
      <SubmitButton>{faq ? "Оновити FAQ" : "Додати FAQ"}</SubmitButton>
    </form>
  );
}
