import { PageHero } from "@/components/sections/PageHero";
import { RouteMap } from "@/components/sections/RouteMap";
import { routes } from "@/lib/content";

import styles from "../Site.module.css";

export default function GeographyPage() {
  return (
    <>
      <PageHero
        eyebrow="Географія"
        text="Статична схема напрямків показує ключові внутрішні та міжнародні маршрути без підключення Google Maps API."
        title="Напрямки перевезень"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <RouteMap />
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
