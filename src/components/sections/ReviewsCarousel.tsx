"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "@/app/[locale]/Site.module.css";
import { PaginatedCollection } from "@/components/ui/PaginatedCollection";

export type PublicReview = {
  author: string;
  body: string;
  id: string;
  role: string;
};

type ReviewLabels = {
  collapse: string;
  empty: string;
  next: string;
  previous: string;
  readMore: string;
};

type ReviewsPreviewProps = {
  items: PublicReview[];
  labels: Pick<ReviewLabels, "collapse" | "empty" | "readMore">;
};

type ReviewsGridProps = {
  items: PublicReview[];
  labels: Pick<ReviewLabels, "collapse" | "empty" | "next" | "previous" | "readMore"> & {
    pagination: string;
  };
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

export function ReviewsPreview({ items, labels }: ReviewsPreviewProps) {
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

export function ReviewsGrid({ items, labels }: ReviewsGridProps) {
  const [pageVersion, setPageVersion] = useState(0);

  if (items.length === 0) {
    return <p className={styles.reviewsEmpty}>{labels.empty}</p>;
  }

  return (
    <PaginatedCollection
      ariaLabel={labels.pagination}
      className={styles.reviewsGrid}
      nextLabel={labels.next}
      onPageChange={() => setPageVersion((version) => version + 1)}
      previousLabel={labels.previous}
    >
      {items.map((item) => (
        <ReviewCard item={item} key={`${pageVersion}-${item.id}`} labels={labels} />
      ))}
    </PaginatedCollection>
  );
}
