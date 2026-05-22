import { PageHero } from "@/components/sections/PageHero";
import { TemperatureDashboard } from "@/components/sections/TemperatureDashboard";
import { fleet } from "@/lib/content";

import styles from "../Site.module.css";

export default function FleetPage() {
  return (
    <>
      <PageHero
        eyebrow="Автопарк"
        text="ПП «АР-Транс» володіє власним сучасним автопарком із понад 50 вантажних автомобілів Volvo FH Euro-6 та рефрижераторними напівпричепами Schmitz Cargobull."
        title="Сучасний автопарк для Європи"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {fleet.map((vehicle) => (
            <article className={styles.card} key={vehicle.title}>
              <span className={styles.icon}>50+</span>
              <h2>{vehicle.title}</h2>
              <p>{vehicle.details}</p>
              <p>{vehicle.temp}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Характеристики</p>
            <h2 className={styles.heading}>20-23 т, GPS, двокамерні рефрижератори та планове ТО</h2>
            <div className={styles.richText}>
              <p>
                Основний транспорт компанії: Volvo FH, Euro-6 та Schmitz Cargobull. Автопарк
                підтримує сучасне охолодження, контроль температури, технічне обслуговування,
                екологічні стандарти та вимоги міжнародної логістики.
              </p>
              <ul>
                {["20-23 тонни", "сучасне охолодження", "двокамерні рефрижератори", "GPS", "контроль температури", "технічне обслуговування", "екологічні стандарти"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <TemperatureDashboard />
        </div>
      </section>
    </>
  );
}
