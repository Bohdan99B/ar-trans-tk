import { PageHero } from "@/components/sections/PageHero";
import { ReviewsGrid } from "@/components/sections/ReviewsCarousel";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

type ReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, where: { moderationStatus: "PUBLISHED" } });
  const isUkrainian = locale === "uk";

  return (
    <>
      <PageHero
        eyebrow={isUkrainian ? "Відгуки" : "Reviews"}
        text={isUkrainian
          ? "Довіра клієнтів — один із головних показників якості нашої роботи. Клієнти цінують дотримання термінів, оперативну комунікацію, контроль вантажу, професійність водіїв і стабільність."
          : "Client trust is one of the main measures of our work. Our clients value reliable timing, responsive communication, cargo control, professional drivers, and consistency."}
        title={isUkrainian ? "Довіра, яка формується рейсами" : "Trust built with every trip"}
      />
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <ReviewsGrid
            items={reviews.map((review) => ({
              author: review.author,
              body: review.body,
              id: review.id,
              role: review.company ?? (isUkrainian ? "Клієнт AR-TRANS" : "AR-TRANS client"),
            }))}
            labels={{
              collapse: isUkrainian ? "Згорнути" : "Show less",
              empty: isUkrainian ? "Опублікованих відгуків ще немає." : "There are no published reviews yet.",
              readMore: isUkrainian ? "Читати більше" : "Read more",
            }}
          />
        </div>
      </section>
    </>
  );
}
