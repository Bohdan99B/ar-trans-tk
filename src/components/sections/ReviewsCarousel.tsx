"use client";

import { useState } from "react";

import styles from "@/app/[locale]/Site.module.css";

type CarouselReview = { author: string; body: string; role: string };

export function ReviewsCarousel({ items }: { items: CarouselReview[] }) {
  const [active, setActive] = useState(0);
  const review = items[active];

  if (!review) {
    return <p>Опублікованих відгуків ще немає.</p>;
  }

  return (
    <div className={styles.carousel} aria-label="Відгуки клієнтів">
      <article className={styles.reviewFeatured}>
        <span>0{active + 1}</span>
        <p>{review.body}</p>
        <h2>{review.author}</h2>
        <small>{review.role}</small>
      </article>
      <div className={styles.carouselRail}>
        {items.map((item, index) => (
          <button
            aria-pressed={active === index}
            className={active === index ? styles.activeReview : undefined}
            key={item.author}
            onClick={() => setActive(index)}
            type="button"
          >
            <strong>{item.author}</strong>
            <span>{item.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
