import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function CooperationPage() {
  return (
    <>
      <PageHero
        eyebrow="Початок співпраці"
        text="Процес побудований так, щоб швидко оцінити маршрут, вантаж, температурний режим і доступність транспорту."
        title="Як почати співпрацю"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <ol className={styles.steps}>
            <li>Надішліть заявку з деталями вантажу, маршруту, ваги та бажаної дати.</li>
            <li>Менеджер уточнить умови, перевірить маршрут і підготує розрахунок.</li>
            <li>Після погодження ставка та статус заявки доступні для контролю.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
