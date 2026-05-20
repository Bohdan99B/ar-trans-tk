import { PageHero } from "@/components/sections/PageHero";
import { RouteMap } from "@/components/sections/RouteMap";
import { routes } from "@/lib/content";

import styles from "../../Site.module.css";

export default function InternationalTransportPage() {
  return (
    <>
      <PageHero
        eyebrow="Експорт та імпорт"
        text="Працюємо з температурними вантажами між Україною та країнами Європи без Google Maps API: маршрути представлені статичною схемою."
        title="Міжнародні рефрижераторні перевезення"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <RouteMap />
          <ul className={styles.routeList}>
            {routes.slice(1).map((route) => (
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
