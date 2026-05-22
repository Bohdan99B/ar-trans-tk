import { PageHero } from "@/components/sections/PageHero";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";

import styles from "../Site.module.css";

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Відгуки"
        text="Довіра клієнтів — один із головних показників якості нашої роботи. Клієнти цінують дотримання термінів, оперативну комунікацію, контроль вантажу, професійність водіїв і стабільність."
        title="Довіра, яка формується рейсами"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <ReviewsCarousel />
        </div>
      </section>
    </>
  );
}
