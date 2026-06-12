"use client";

import { Children, type ReactNode, useMemo, useState } from "react";

import styles from "../Admin.module.css";

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
  const [openVehicleId, setOpenVehicleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const cards = Children.toArray(children);
  const normalizedSearch = search.trim().toLocaleLowerCase("uk-UA");
  const visibleVehicles = useMemo(
    () => vehicles
      .map((vehicle, index) => ({ index, vehicle }))
      .filter(({ vehicle }) => vehicle.title.toLocaleLowerCase("uk-UA").includes(normalizedSearch)),
    [normalizedSearch, vehicles],
  );

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Пошук за реєстраційним номером"
            type="search"
            value={search}
          />
        </label>
      </div>

      {visibleVehicles.length === 0 ? (
        <p className={styles.empty}>Автомобілі за цим запитом не знайдено</p>
      ) : (
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
