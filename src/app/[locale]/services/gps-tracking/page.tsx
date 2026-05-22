import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function GpsTrackingPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="GPS"
        text="Ми використовуємо сучасні системи GPS-моніторингу транспорту, що дозволяє забезпечувати повний контроль перевезень у режимі реального часу."
        title="GPS-відстеження транспорту"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {["Live позиція", "Контроль маршруту", "Оперативна комунікація", "Статуси рейсу"].map((item) => (
            <article className={styles.card} key={item}>
              <h2>{item}</h2>
              <p>Менеджер бачить контекст рейсу та може швидко реагувати на зміни маршруту, часу або умов доставки.</p>
            </article>
          ))}
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>Замовити перевезення</Link>
          </div>
        </div>
      </section>
    </>
  );
}
