import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { SectionIcon } from "@/components/sections/Icons";
import { getSiteServices } from "@/lib/site-content";

import styles from "../Site.module.css";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const services = await getSiteServices(locale);

  return (
    <>
      <PageHero
        eyebrow="Наші послуги"
        text="Рефрижераторні, міжнародні та внутрішні перевезення з GPS-контролем, температурною звітністю, CMR-страхуванням і менеджерським супроводом."
        title="Логістичні сервіси для контрольованої доставки"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid} ${styles.gridThree}`}>
          {services.map((service) => (
            <Link className={styles.card} href={`/${locale}/services/${service.slug}`} key={service.slug}>
              <span className={styles.icon}><SectionIcon label={service.icon} /></span>
              <h2>{service.title}</h2>
              <p>{service.summary}</p>
              <ul>
                {service.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span className={styles.cardCta}>Детальніше</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
