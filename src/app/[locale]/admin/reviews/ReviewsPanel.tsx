"use client";

import { Children, type ReactNode, useMemo, useState } from "react";

import styles from "../Admin.module.css";

const PAGE_SIZE = 4;

type ReviewListItem = {
  author: string;
  company: string | null;
  id: string;
  moderationStatus: "PENDING" | "PUBLISHED" | "HIDDEN";
  searchText: string;
};

const statusOptions = [
  { label: "Усі статуси", value: "" },
  { label: "Очікує", value: "PENDING" },
  { label: "Приховано", value: "HIDDEN" },
  { label: "Опубліковано", value: "PUBLISHED" },
] as const;

export function ReviewsPanel({
  children,
  reviews,
}: {
  children: ReactNode;
  reviews: ReviewListItem[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const cards = Children.toArray(children);
  const normalizedSearch = search.trim().toLocaleLowerCase("uk-UA");
  const filteredReviews = useMemo(
    () => reviews
      .map((review, index) => ({ index, review }))
      .filter(({ review }) => !status || review.moderationStatus === status)
      .filter(({ review }) => review.searchText.includes(normalizedSearch)),
    [normalizedSearch, reviews, status],
  );
  const pageCount = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const visibleReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const hasFilters = Boolean(normalizedSearch || status);

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
    setOpenReviewId(null);
  }

  function updateStatus(value: string) {
    setStatus(value);
    setCurrentPage(1);
    setOpenReviewId(null);
  }

  function updatePage(page: number) {
    setCurrentPage(page);
    setOpenReviewId(null);
  }

  return (
    <section className={styles.panel}>
      <div className={`${styles.pageHeader} ${styles.reviewPanelHeader}`}>
        <div>
          <h2>Створені відгуки</h2>
          <p className={styles.muted}>Знаходьте відгуки за даними картки та керуйте їхнім статусом.</p>
        </div>
        <div className={styles.reviewFilters}>
          <label className={styles.searchField}>
            <span>Пошук</span>
            <input
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Автор, компанія, текст, дата..."
              type="search"
              value={search}
            />
          </label>
          <label className={styles.reviewStatusFilter}>
            <span>Статус</span>
            <select onChange={(event) => updateStatus(event.target.value)} value={status}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visibleReviews.length === 0 ? (
        <p aria-live="polite" className={styles.empty}>
          {reviews.length === 0
            ? "Відгуків ще немає."
            : hasFilters
              ? "За вибраними фільтрами відгуків не знайдено."
              : "Відгуків ще немає."}
        </p>
      ) : (
        <>
          <div className={`${styles.cards} ${styles.reviewCards}`}>
            {visibleReviews.map(({ index, review }) => {
              const open = openReviewId === review.id;

              return (
                <article
                  className={`${styles.applicationAccordion} ${styles.reviewCard} ${open ? styles.expandedCard : ""}`}
                  key={review.id}
                >
                  <button
                    aria-expanded={open}
                    className={styles.applicationSummary}
                    onClick={() => setOpenReviewId(open ? null : review.id)}
                    type="button"
                  >
                    <span>
                      <strong>{review.author}</strong>
                      <small>{review.company || "Компанію не вказано"}</small>
                    </span>
                    <span className={styles.viewAction}>{open ? "Згорнути" : "Переглянути більше"}</span>
                    <b aria-hidden="true">{open ? "-" : "+"}</b>
                  </button>
                  <div
                    aria-hidden={!open}
                    className={styles.accordionBody}
                    data-open={open}
                    inert={!open ? true : undefined}
                  >
                    <div className={styles.accordionInner}>{cards[index]}</div>
                  </div>
                </article>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <nav aria-label="Сторінки відгуків" className={styles.pagination}>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  aria-current={page === currentPage ? "page" : undefined}
                  key={page}
                  onClick={() => updatePage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
