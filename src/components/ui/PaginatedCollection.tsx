"use client";

import { Children, useState, useSyncExternalStore, type ReactNode } from "react";

import styles from "./PaginatedCollection.module.css";

type PaginatedCollectionProps = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  nextLabel: string;
  onPageChange?: () => void;
  previousLabel: string;
};

const TABLET_QUERY = "(min-width: 768px)";
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToViewport(callback: () => void) {
  const tabletQuery = window.matchMedia(TABLET_QUERY);
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);

  tabletQuery.addEventListener("change", callback);
  desktopQuery.addEventListener("change", callback);

  return () => {
    tabletQuery.removeEventListener("change", callback);
    desktopQuery.removeEventListener("change", callback);
  };
}

function getItemsPerPage() {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 3;
  if (window.matchMedia(TABLET_QUERY).matches) return 2;
  return 1;
}

function useItemsPerPage() {
  return useSyncExternalStore(subscribeToViewport, getItemsPerPage, () => 1);
}

export function PaginatedCollection({
  ariaLabel,
  children,
  className,
  nextLabel,
  onPageChange,
  previousLabel,
}: PaginatedCollectionProps) {
  const items = Children.toArray(children);
  const itemsPerPage = useItemsPerPage();
  const pages = Array.from(
    { length: Math.ceil(items.length / itemsPerPage) },
    (_, index) => items.slice(index * itemsPerPage, (index + 1) * itemsPerPage),
  );
  const [pageStart, setPageStart] = useState(0);
  const activePage = Math.min(
    Math.floor(pageStart / itemsPerPage),
    Math.max(0, pages.length - 1),
  );
  const hasPagination = pages.length > 1;

  const goToPage = (page: number) => {
    setPageStart(page * itemsPerPage);
    onPageChange?.();
  };

  return (
    <div
      aria-label={ariaLabel}
      className={`${styles.collection} ${hasPagination ? styles.collectionPaginated : ""}`}
      role="region"
    >
      <div className={styles.pages}>
        {pages.map((pageItems, index) => {
          const isActive = index === activePage;

          return (
            <div
              aria-hidden={!isActive}
              className={`${className} ${styles.page} ${isActive ? styles.pageActive : ""}`}
              inert={!isActive}
              key={index}
            >
              {pageItems}
            </div>
          );
        })}
      </div>
      {hasPagination ? (
        <nav aria-label={ariaLabel} className={styles.controls}>
          <button
            aria-label={previousLabel}
            className={styles.button}
            disabled={activePage === 0}
            onClick={() => goToPage(Math.max(0, activePage - 1))}
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label={nextLabel}
            className={styles.button}
            disabled={activePage === pages.length - 1}
            onClick={() => goToPage(Math.min(pages.length - 1, activePage + 1))}
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
