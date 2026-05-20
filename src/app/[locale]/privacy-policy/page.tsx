import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Документи"
        text="Ми використовуємо контактні дані тільки для обробки заявок, комунікації з клієнтом і підготовки розрахунку перевезення."
        title="Політика конфіденційності"
      />
      <section className={styles.sectionAlt}>
        <article className={`${styles.container} ${styles.card}`}>
          <p>
            Дані з форм зберігаються в базі заявок і доступні авторизованим адміністраторам.
            Клієнт може звернутися для уточнення або видалення контактної інформації.
          </p>
        </article>
      </section>
    </>
  );
}
