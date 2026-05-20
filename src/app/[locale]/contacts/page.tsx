import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { PageHero } from "@/components/sections/PageHero";
import { managers } from "@/lib/content";

import styles from "../Site.module.css";

export default function ContactsPage() {
  return (
    <>
      <PageHero
        eyebrow="Контакти"
        text="Зв'яжіться з менеджером для розрахунку маршруту, температурного режиму та доступності фури."
        title="Менеджери AR Trans TK"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.managerList}>
            {managers.map((manager) => (
              <article className={styles.manager} key={manager.email}>
                <h2>{manager.name}</h2>
                <p>{manager.role}</p>
                <p>{manager.phone}</p>
                <p>{manager.email}</p>
              </article>
            ))}
          </div>
          <ContactCallbackForm />
        </div>
      </section>
    </>
  );
}
