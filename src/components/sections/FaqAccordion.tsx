"use client";

import Link from "next/link";
import { useState } from "react";

import { faqs } from "@/lib/content";
import styles from "@/app/[locale]/Site.module.css";

type FaqAccordionProps = {
  locale: string;
};

export function FaqAccordion({ locale }: FaqAccordionProps) {
  const [open, setOpen] = useState(0);

  return (
    <div className={styles.accordion}>
      {faqs.map((faq, index) => (
        <article className={styles.accordionItem} key={faq.q}>
          <button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)} type="button">
            <span>{faq.q}</span>
            <b>{open === index ? "-" : "+"}</b>
          </button>
          <div className={styles.accordionBody} hidden={open !== index}>
            <p>{faq.a}</p>
            <Link href={`/${locale}/${faq.href}`}>Перейти до розділу</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
