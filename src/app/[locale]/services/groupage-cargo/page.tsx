import { PageHero } from "@/components/sections/PageHero";

import styles from "../../Site.module.css";

export default function GroupageCargoPage() {
  return (
    <>
      <PageHero
        eyebrow="Для постійних клієнтів"
        text="Збірні вантажі доступні для клієнтів із регулярними поставками, сумісними температурними режимами та погодженим графіком."
        title="Збірні рефрижераторні вантажі"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {["Планування графіка", "Сумісність вантажів", "Контроль температури", "Прозорі статуси"].map((item) => (
            <article className={styles.card} key={item}>
              <h2>{item}</h2>
              <p>Умови погоджуються менеджером перед першим регулярним рейсом.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
