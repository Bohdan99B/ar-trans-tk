import { PageHero } from "@/components/sections/PageHero";
import { EuropeMap } from "@/components/sections/EuropeMap";
import { routes } from "@/lib/content";

import styles from "../../Site.module.css";

export default function InternationalTransportPage() {
  return (
    <>
      <PageHero
        eyebrow="Експорт та імпорт"
        text="Оптимальні маршрути, митний супровід, документація, страхування та контроль доставки між Україною та країнами Європи."
        title="Міжнародні рефрижераторні перевезення"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <EuropeMap />
          <ul className={styles.routeList}>
            {routes.map((route) => (
              <li key={route.country}>
                <strong>{route.country}</strong>
                <span>{route.destination}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
