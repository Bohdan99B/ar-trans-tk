import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function CargoInsurancePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="CMR"
        text="CMR-страхування вантажів до 550 000$ та контроль документів для міжнародних і внутрішніх перевезень."
        title="Страхування вантажів"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {["CMR до 550 000$", "Страхові сертифікати", "Документи рейсу", "Контроль ризиків"].map((item) => (
            <article className={styles.card} key={item}>
              <h2>{item}</h2>
              <p>Параметр перевіряється та погоджується менеджером під конкретний маршрут, вантаж і вимоги клієнта.</p>
            </article>
          ))}
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>Отримати розрахунок</Link>
          </div>
        </div>
      </section>
    </>
  );
}
