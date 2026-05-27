import { PageHero } from "@/components/sections/PageHero";
import { EuropeMap } from "@/components/sections/EuropeMap";
import { getSiteRoutes } from "@/lib/site-content";

import styles from "../Site.module.css";

export default async function GeographyPage() {
  const routes = await getSiteRoutes();
  return (
    <>
      <PageHero
        eyebrow="Географія"
        text="ПП «АР-Транс» здійснює перевезення по всій території Європи. Основний акцент — Італія, а також Німеччина, Франція, Іспанія, Бельгія, Нідерланди, Чехія, Австрія та інші країни."
        title="Європейська географія з фокусом на Італію"
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
