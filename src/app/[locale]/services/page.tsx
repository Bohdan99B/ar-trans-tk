import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { services } from "@/lib/content";

import styles from "../Site.module.css";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="Наші послуги"
        text="Компанія фокусується на рефрижераторних перевезеннях фурами до 22 тонн, міжнародних маршрутах, збірних вантажах для постійних клієнтів та гнучких умовах оплати."
        title="Температурна логістика для бізнесу"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {services.map((service) => (
            <Link className={styles.card} href={`/${locale}/services/${service.slug}`} key={service.slug}>
              <span className={styles.icon}>{service.icon}</span>
              <h2>{service.titleUk}</h2>
              <p>{service.summaryUk}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
