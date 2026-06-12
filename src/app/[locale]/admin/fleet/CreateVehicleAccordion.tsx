"use client";

import { type ReactNode, useState } from "react";

import styles from "../Admin.module.css";

export function CreateVehicleAccordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <article className={styles.applicationAccordion}>
      <button
        aria-expanded={open}
        className={`${styles.applicationSummary} ${styles.createVehicleSummary}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>
          <strong>Добавити новий транспорт</strong>
        </span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>
      <div aria-hidden={!open} className={styles.accordionBody} data-open={open} inert={!open ? true : undefined}>
        <div className={styles.accordionInner}>{children}</div>
      </div>
    </article>
  );
}
