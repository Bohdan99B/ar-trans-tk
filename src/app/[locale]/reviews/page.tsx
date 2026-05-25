import { PageHero } from "@/components/sections/PageHero";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, where: { moderationStatus: "PUBLISHED" } });
  return (
    <>
      <PageHero
        eyebrow="Відгуки"
        text="Довіра клієнтів — один із головних показників якості нашої роботи. Клієнти цінують дотримання термінів, оперативну комунікацію, контроль вантажу, професійність водіїв і стабільність."
        title="Довіра, яка формується рейсами"
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <ReviewsCarousel items={reviews.map((review) => ({ author: review.author, body: review.body, role: review.company ?? "Клієнт AR-TRANS" }))} />
        </div>
      </section>
    </>
  );
}
