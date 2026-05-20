import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RefrigeratedTransportPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <>
      <PageHero
        eyebrow="Ключова послуга"
        text="Фури-рефрижератори до 22 тонн для вантажів, яким потрібен стабільний температурний режим, чистий кузов, контроль маршруту та зрозуміла комунікація."
        title="Рефрижераторні перевезення до 22 т"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.card}>
            <h2>Що перевозимо</h2>
            <p>Охолоджені та заморожені продукти, напої, фармацевтичні товари, сировину та інші температурні вантажі.</p>
          </div>
          <div className={styles.card}>
            <h2>Як контролюємо</h2>
            <p>Погоджуємо режим до виїзду, фіксуємо вимоги до завантаження, тримаємо менеджерський супровід під час рейсу.</p>
          </div>
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>
              Замовити перевезення
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
