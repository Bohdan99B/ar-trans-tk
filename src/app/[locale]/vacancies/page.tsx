import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function VacanciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Вакансії"
        text="Шукаємо людей, які розуміють відповідальність температурної логістики та люблять порядок у процесах."
        title="Кар'єра в AR Trans TK"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {["Водій міжнародних рейсів", "Логіст рефрижераторних перевезень"].map((title) => (
            <article className={styles.card} key={title}>
              <h2>{title}</h2>
              <p>Надішліть контакти через форму на сторінці контактів, і менеджер повернеться з деталями.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
