import Image from "next/image";

import { PageHero } from "@/components/sections/PageHero";
import { TemperatureDashboard } from "@/components/sections/TemperatureDashboard";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

export default async function FleetPage() {
  const fleet = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" }, where: { isActive: true } });
  return (
    <>
      <PageHero
        eyebrow="Автопарк"
        text="ПП «АР-Транс» володіє власним сучасним автопарком із понад 50 вантажних автомобілів Volvo FH Euro-6 та рефрижераторними напівпричепами Schmitz Cargobull."
        title="Сучасний автопарк для Європи"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.fleetGrid}`}>
          {fleet.length === 0 ? <p>Активного транспорту поки немає.</p> : fleet.map((vehicle) => (
            <article className={`${styles.card} ${styles.fleetCard}`} key={vehicle.id}>
              {vehicle.photoUrl ? (
                <div className={styles.fleetImageBox}>
                  <Image
                    alt={vehicle.title}
                    className={styles.fleetCardImage}
                    height={675}
                    src={vehicle.photoUrl}
                    width={1200}
                  />
                </div>
              ) : null}
              <h2>{vehicle.title}</h2>
              {vehicle.brand ? <p className={styles.fleetCardBrand}>{vehicle.brand}</p> : null}
              <p>{vehicle.description ?? ""}</p>
              <dl className={`${styles.fleetMeta} ${styles.fleetMetaTwoColumn}`}>
                <div>
                  <dt>Вантажопідйомність:</dt>
                  <dd>{vehicle.payloadTonnes.toString()} т</dd>
                </div>
                <div>
                  <dt>Обʼєм:</dt>
                  <dd>{vehicle.volume || "Не вказано"}</dd>
                </div>
                <div className={styles.fleetMetaWide}>
                  <dt>Температурний режим:</dt>
                  <dd>{vehicle.temperatureFrom}...{vehicle.temperatureTo} °C</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Характеристики</p>
            <h2 className={styles.heading}>20-23 т, GPS, двокамерні рефрижератори та планове ТО</h2>
            <div className={styles.richText}>
              <p>
                Основний транспорт компанії: Volvo FH, Euro-6 та Schmitz Cargobull. Автопарк
                підтримує сучасне охолодження, контроль температури, технічне обслуговування,
                екологічні стандарти та вимоги міжнародної логістики.
              </p>
              <ul>
                {["20-23 тонни", "сучасне охолодження", "двокамерні рефрижератори", "GPS", "контроль температури", "технічне обслуговування", "екологічні стандарти"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <TemperatureDashboard />
        </div>
      </section>
    </>
  );
}
