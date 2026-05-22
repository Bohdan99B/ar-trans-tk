import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { TemperatureDashboard } from "@/components/sections/TemperatureDashboard";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function TemperatureReportingPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        eyebrow="Температурний контроль"
        text="Для вантажів, що потребують суворого температурного режиму, ми забезпечуємо постійний моніторинг температури, відстеження маршруту та контроль стабільності показників."
        title="Температурна звітність та оперативний контроль"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <TemperatureDashboard />
          <div className={styles.featureGrid}>
            {[
              "Моніторинг температури в реальному часі",
              "Температурні звіти",
              "Відстеження маршруту",
              "Контроль стабільності показників",
            ].map((item) => (
              <article className={styles.card} key={item}>
                <h2>{item}</h2>
                <p>Контроль температури допомагає зберігати якість вантажу та прозоро підтверджувати умови перевезення.</p>
              </article>
            ))}
            <div className={`${buttonStyles.row} ${styles.featureCta}`}>
              <Link className={buttonStyles.primary} href={`/${locale}/order`}>Замовити перевезення</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
