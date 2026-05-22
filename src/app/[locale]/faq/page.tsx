import { QuestionForm } from "@/components/forms/QuestionForm";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        text="Клікабельні відповіді на базові питання про вантажі, країни, страхування та терміни доставки."
        title="Питання / відповіді"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <FaqAccordion locale={locale} />
          <QuestionForm />
        </div>
      </section>
    </>
  );
}
