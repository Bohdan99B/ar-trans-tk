import { PageHero } from "@/components/sections/PageHero";
import { fleet } from "@/lib/content";

import styles from "../Site.module.css";

export default function FleetPage() {
  return (
    <>
      <PageHero
        eyebrow="Автопарк"
        text="Парк сформований під одну спеціалізацію: температурні перевезення фурами-рефрижераторами до 22 тонн."
        title="Рефрижераторні фури"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {fleet.map((vehicle) => (
            <article className={styles.card} key={vehicle.title}>
              <span className={styles.icon}>22T</span>
              <h2>{vehicle.title}</h2>
              <p>{vehicle.details}</p>
              <p>{vehicle.temp}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
