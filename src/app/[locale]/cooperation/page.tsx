import { CooperationDirections } from "@/components/forms/CooperationDirections";
import buttonStyles from "@/components/ui/Buttons.module.css";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

const benefits = {
  en: [
    "International routes",
    "Refrigerated transport",
    "GPS control and transparent processes",
    "Experience since 2002",
    "Teamwork and responsibility",
  ],
  uk: [
    "Міжнародні маршрути",
    "Рефрижераторні перевезення",
    "GPS-контроль і прозорість процесів",
    "Досвід з 2002 року",
    "Командна робота і відповідальність",
  ],
};

export default async function CooperationPage({ params }: PageProps) {
  const { locale } = await params;
  const language = locale === "en" ? "en" : "uk";
  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: "desc" },
    select: { description: true, id: true, location: true, requirements: true, titleEn: true, titleUk: true },
    where: { isPublished: true, status: "ACTIVE" },
  });
  const copy = language === "en" ? {
    benefitHeading: "Why professionals work with us",
    cta: "Discuss cooperation",
    eyebrow: "Cooperation",
    heroText: "We are open to cooperation with responsible logistics, international and refrigerated transport professionals.",
    heroTitle: "Grow together with AR-TRANS",
  } : {
    benefitHeading: "Чому з нами працюють",
    cta: "Обговорити співпрацю",
    eyebrow: "Співпраця",
    heroText: "Ми відкриті до співпраці з відповідальними фахівцями у сфері логістики, міжнародних та рефрижераторних перевезень.",
    heroTitle: "Розвивайтесь разом з AR-TRANS",
  };

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 className={styles.title}>{copy.heroTitle}</h1>
          <p className={styles.lead}>{copy.heroText}</p>
          <div className={`${buttonStyles.row} ${styles.heroActions}`}>
            <a className={buttonStyles.primary} href="#directions">{copy.cta}</a>
          </div>
        </div>
      </section>
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{copy.benefitHeading}</p>
          <h2 className={styles.heading}>{copy.benefitHeading}</h2>
          <div className={styles.cooperationBenefits}>
            {benefits[language].map((benefit) => (
              <article className={styles.card} key={benefit}>
                <h3>{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CooperationDirections
        locale={language}
        vacancies={vacancies.map((vacancy) => ({
          description: vacancy.description,
          id: vacancy.id,
          location: vacancy.location,
          requirements: vacancy.requirements,
          title: language === "en" ? vacancy.titleEn : vacancy.titleUk,
        }))}
      />
    </>
  );
}
