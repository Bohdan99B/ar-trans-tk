"use client";

import Link from "next/link";
import { useState } from "react";

import { faqs } from "@/lib/content";
import styles from "@/app/[locale]/Site.module.css";

type FaqAccordionProps = {
  className?: string;
  locale: string;
};

export function FaqAccordion({ className, locale }: FaqAccordionProps) {
  const [open, setOpen] = useState(-1);

  return (
    <div className={`${styles.accordion}${className ? ` ${className}` : ""}`}>
      {faqs.map((faq, index) => (
        <article className={styles.accordionItem} key={faq.q}>
          <button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)} type="button">
            <span>{faq.q}</span>
            <b>{open === index ? "-" : "+"}</b>
          </button>
          <div
            aria-hidden={open !== index}
            className={styles.accordionBody}
            data-open={open === index}
            inert={open !== index ? true : undefined}
          >
            <div className={styles.accordionBodyInner}>
              <p>{faq.a}</p>
              <Link href={`/${locale}/${faq.href}`}>Перейти до розділу</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
