import { PageHero } from "@/components/sections/PageHero";
import { reviews } from "@/lib/content";

import styles from "../Site.module.css";

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Відгуки"
        text="Клієнти цінують прогнозованість, температурний контроль і зрозумілу комунікацію менеджера."
        title="Досвід клієнтів"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {reviews.map((review) => (
            <article className={styles.card} key={review.author}>
              <h2>{review.author}</h2>
              <p>{review.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
