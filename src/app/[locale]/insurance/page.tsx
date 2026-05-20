import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function InsurancePage() {
  return (
    <>
      <PageHero
        eyebrow="Страхування"
        text="Страхування вантажу погоджується відповідно до типу товару, маршруту, вартості та вимог клієнта."
        title="Страхування температурного вантажу"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {["Вартість вантажу", "Температурний режим", "Маршрут", "Документи"].map((item) => (
            <article className={styles.card} key={item}>
              <h2>{item}</h2>
              <p>Параметр враховується менеджером під час підготовки пропозиції.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
