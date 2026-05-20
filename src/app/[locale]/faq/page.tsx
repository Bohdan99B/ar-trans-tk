import { QuestionForm } from "@/components/forms/QuestionForm";
import { PageHero } from "@/components/sections/PageHero";
import { faqs } from "@/lib/content";

import styles from "../Site.module.css";

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        text="Відповіді на базові питання про температурні перевезення, статус заявки та регулярну співпрацю."
        title="Питання / відповіді"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.grid}>
            {faqs.map((faq) => (
              <article className={styles.card} key={faq.q}>
                <h2>{faq.q}</h2>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
          <QuestionForm />
        </div>
      </section>
    </>
  );
}
