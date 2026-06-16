"use client";

import { Children, type ReactNode, useMemo, useState } from "react";

import styles from "@/components/admin/Admin.module.css";

const PAGE_SIZE = 9;

type FleetCardItem = {
  id: string;
  title: string;
};

export function FleetCardsPanel({
  children,
  vehicles,
}: {
  children: ReactNode;
  vehicles: FleetCardItem[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openVehicleId, setOpenVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const cards = Children.toArray(children);
  const normalizedSearch = search.trim().toLocaleLowerCase("uk-UA");
  const filteredVehicles = useMemo(
    () => vehicles
      .map((vehicle, index) => ({ index, vehicle }))
      .filter(({ vehicle }) => vehicle.title.toLocaleLowerCase("uk-UA").includes(normalizedSearch)),
    [normalizedSearch, vehicles],
  );
  const pageCount = Math.ceil(filteredVehicles.length / PAGE_SIZE);
  const activePage = Math.min(currentPage, Math.max(1, pageCount));
  const visibleVehicles = filteredVehicles.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
    setOpenVehicleId(null);
  }

  function updatePage(page: number) {
    setCurrentPage(page);
    setOpenVehicleId(null);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Створені автомобілі</h2>
          <p className={styles.muted}>Керуйте реєстраційними номерами, характеристиками, фото та доступністю.</p>
        </div>
        <label className={styles.searchField}>
          <span>Пошук</span>
          <input
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Пошук за реєстраційним номером"
            type="search"
            value={search}
          />
        </label>
      </div>

      {visibleVehicles.length === 0 ? (
        <p aria-live="polite" className={styles.empty}>Автомобілі за цим запитом не знайдено.</p>
      ) : (
        <>
          <div className={styles.cards}>
            {visibleVehicles.map(({ index, vehicle }) => {
              const open = openVehicleId === vehicle.id;

              return (
                <article className={`${styles.applicationAccordion} ${styles.vehicleCard} ${open ? styles.expandedCard : ""}`} key={vehicle.id}>
                  <button
                    aria-expanded={open}
                    className={styles.applicationSummary}
                    onClick={() => setOpenVehicleId(open ? null : vehicle.id)}
                    type="button"
                  >
                    <span>
                      <strong>{vehicle.title}</strong>
                      <small>Реєстраційний номер</small>
                    </span>
                    <span className={styles.viewAction}>{open ? "Згорнути" : "Переглянути"}</span>
                    <b aria-hidden="true">{open ? "-" : "+"}</b>
                  </button>
                  <AnimatedPanel open={open}>{cards[index]}</AnimatedPanel>
                </article>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <nav aria-label="Сторінки автомобілів" className={styles.pagination}>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  aria-current={page === activePage ? "page" : undefined}
                  aria-label={`Сторінка ${page}`}
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

function AnimatedPanel({ children, open }: { children: ReactNode; open: boolean }) {
  return (
    <div aria-hidden={!open} className={styles.accordionBody} data-open={open} inert={!open ? true : undefined}>
      <div className={styles.accordionInner}>{children}</div>
    </div>
  );
}
