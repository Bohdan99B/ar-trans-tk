import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { TemperatureDashboard } from "@/components/sections/TemperatureDashboard";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../../Site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RefrigeratedTransportPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <>
      <PageHero
        eyebrow="Ключова послуга"
        text="Професійні перевезення вантажів, що потребують дотримання температурного режиму. Рефрижератори забезпечують стабільну температуру під час усього маршруту."
        title="Рефрижераторні перевезення 20-23 т"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <TemperatureDashboard />
          <div className={styles.card}>
            <h2>Що перевозимо</h2>
            <ul>
              <li>продукти харчування;</li>
              <li>молочну продукцію;</li>
              <li>м&apos;ясо та рибу;</li>
              <li>медикаменти;</li>
              <li>фармацевтичну продукцію;</li>
              <li>інші чутливі вантажі.</li>
            </ul>
          </div>
          <div className={styles.card}>
            <h2>Можливості</h2>
            <ul>
              <li>двокамерні рефрижератори;</li>
              <li>температурний контроль;</li>
              <li>моніторинг у режимі поточного часу;</li>
              <li>звітність по температурі;</li>
              <li>GPS-контроль маршруту.</li>
            </ul>
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
