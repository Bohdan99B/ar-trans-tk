import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function UkraineTransportPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="Україна"
        text="Внутрішні перевезення по Україні для виробників, дистриб'юторів і мереж з контролем маршруту, графіка та стану вантажу."
        title="Внутрішні вантажні перевезення"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <article className={styles.card}>
            <h2>Що беремо в роботу</h2>
            <p>Температурні та стандартні партії, регулярні поставки, маршрути між складами, виробництвами та торговими мережами.</p>
          </article>
          <article className={styles.card}>
            <h2>Як контролюємо</h2>
            <p>Плануємо маршрут, координуємо завантаження, тримаємо GPS-контроль і комунікацію з водієм та менеджером.</p>
          </article>
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>Замовити перевезення</Link>
          </div>
        </div>
      </section>
    </>
  );
}
