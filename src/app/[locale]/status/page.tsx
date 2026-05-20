import { StatusCheckForm } from "@/components/forms/StatusCheckForm";
import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Статус заявки"
        text="Введіть номер заявки та email або телефон, який був зазначений у формі."
        title="Перевірити статус заявки"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <StatusCheckForm />
        </div>
      </section>
    </>
  );
}
