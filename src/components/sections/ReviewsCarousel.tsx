"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "@/app/[locale]/Site.module.css";

export type PublicReview = {
  author: string;
  body: string;
  id: string;
  role: string;
};

type ReviewLabels = {
  carousel: string;
  collapse: string;
  empty: string;
  next: string;
  previous: string;
  readMore: string;
};

type ReviewsCarouselProps = {
  items: PublicReview[];
  labels: ReviewLabels;
};

type ReviewsGridProps = {
  items: PublicReview[];
  labels: Pick<ReviewLabels, "collapse" | "empty" | "readMore">;
};

const LONG_REVIEW_LENGTH = 160;

function ReviewCard({
  item,
  labels,
}: {
  item: PublicReview;
  labels: Pick<ReviewLabels, "collapse" | "readMore">;
}) {
  const [expanded, setExpanded] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(0);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const isLong = item.body.length > LONG_REVIEW_LENGTH;
  const bodyId = `review-body-${item.id}`;
  const bodyFrameStyle = bodyHeight
    ? ({ "--review-body-height": `${bodyHeight}px` } as CSSProperties)
    : undefined;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !isLong) return;

    const updateBodyHeight = () => setBodyHeight(body.scrollHeight);
    updateBodyHeight();

    const resizeObserver = new ResizeObserver(updateBodyHeight);
    resizeObserver.observe(body);

    return () => resizeObserver.disconnect();
  }, [isLong, item.body]);

  return (
    <article className={`${styles.reviewCard} ${expanded ? styles.reviewCardExpanded : ""}`}>
      <span aria-hidden="true" className={styles.reviewQuote}>
        “
      </span>
      <div
        className={`${styles.reviewBodyFrame} ${
          isLong
            ? expanded
              ? styles.reviewBodyFrameExpanded
              : styles.reviewBodyFrameCollapsed
            : ""
        }`}
        id={bodyId}
        style={bodyFrameStyle}
      >
        <p className={styles.reviewBody} ref={bodyRef}>
          {item.body}
        </p>
      </div>
      <div className={styles.reviewMoreSlot}>
        {isLong ? (
          <button
            aria-controls={bodyId}
            aria-expanded={expanded}
            className={styles.reviewMore}
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? labels.collapse : labels.readMore}
          </button>
        ) : null}
      </div>
      <footer className={styles.reviewAuthor}>
        <span aria-hidden="true">{item.author.trim().charAt(0).toLocaleUpperCase()}</span>
        <div>
          <h3>{item.author}</h3>
          <p>{item.role}</p>
        </div>
      </footer>
    </article>
  );
}

export function ReviewsCarousel({ items, labels }: ReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const updateActive = useCallback(() => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild as HTMLElement | null;

    if (!track || !firstCard) return;

    const step = firstCard.offsetWidth + Number.parseFloat(getComputedStyle(track).columnGap || "0");
    const visible = Math.max(1, Math.round((track.clientWidth + step - firstCard.offsetWidth) / step));
    const maxActive = Math.max(0, items.length - visible);

    setVisibleCount(visible);
    setActive(Math.min(maxActive, Math.max(0, Math.round(track.scrollLeft / step))));
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateActive();
    const resizeObserver = new ResizeObserver(updateActive);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, [updateActive]);

  const scrollToReview = (index: number) => {
    const track = trackRef.current;
    const card = track?.children.item(index) as HTMLElement | null;
    if (!track || !card) return;

    track.scrollTo({ behavior: "smooth", left: card.offsetLeft - track.offsetLeft });
  };

  if (items.length === 0) {
    return <p className={styles.reviewsEmpty}>{labels.empty}</p>;
  }

  return (
    <div className={styles.reviewsCarousel} aria-label={labels.carousel}>
      <div className={styles.reviewsTrack} onScroll={updateActive} ref={trackRef}>
        {items.map((item) => (
          <ReviewCard item={item} key={item.id} labels={labels} />
        ))}
      </div>
      {items.length > visibleCount ? (
        <div className={styles.reviewsControls}>
          <p aria-live="polite">
            <strong>{active + 1}</strong>
            <span>/ {items.length - visibleCount + 1}</span>
          </p>
          <div>
            <button
              aria-label={labels.previous}
              disabled={active === 0}
              onClick={() => scrollToReview(active - 1)}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label={labels.next}
              disabled={active === items.length - visibleCount}
              onClick={() => scrollToReview(active + 1)}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReviewsGrid({ items, labels }: ReviewsGridProps) {
  if (items.length === 0) {
    return <p className={styles.reviewsEmpty}>{labels.empty}</p>;
  }

  return (
    <div className={styles.reviewsGrid}>
      {items.map((item) => (
        <ReviewCard item={item} key={item.id} labels={labels} />
      ))}
    </div>
  );
}
