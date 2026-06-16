import { QuestionForm } from "@/components/forms/QuestionForm";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { PageHero } from "@/components/sections/PageHero";
import { getSiteFaqs } from "@/lib/content";

import styles from "../Site.module.css";

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  const faqs = await getSiteFaqs(locale);

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        text="Зібрали найпоширеніші питання клієнтів щодо перевезень, географії доставки, страхування та логістичних процесів."
        title="Найчастіші запитання"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.faqLayout}`}>
          <FaqAccordion className={styles.faqGrid} items={faqs} locale={locale} />
          <QuestionForm className={styles.faqForm} />
        </div>
      </section>
    </>
  );
}
