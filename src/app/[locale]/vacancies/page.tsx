import { VacancyApplicationForm } from "@/components/forms/VacancyApplicationForm";
import { PageHero } from "@/components/sections/PageHero";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function VacanciesPage({ params }: PageProps) {
  const { locale } = await params;
  const vacancies = await prisma.vacancy.findMany({ orderBy: { createdAt: "desc" }, where: { status: "ACTIVE" } });

  return (
    <>
      <PageHero
        eyebrow="Вакансії"
        text="Шукаємо людей, які розуміють відповідальність температурної логістики та люблять порядок у процесах."
        title="Кар'єра в AR Trans TK"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {vacancies.length === 0 ? <p>Активних вакансій зараз немає.</p> : vacancies.map((vacancy) => (
            <article className={styles.card} key={vacancy.id}>
              <h2>{locale === "en" ? vacancy.titleEn : vacancy.titleUk}</h2>
              <p>{vacancy.location}{vacancy.salary ? ` · ${vacancy.salary}` : ""}</p>
              <p>{vacancy.description}</p>
              {vacancy.requirements ? <p>{vacancy.requirements}</p> : null}
              <VacancyApplicationForm vacancyId={vacancy.id} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
