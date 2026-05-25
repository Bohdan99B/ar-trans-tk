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
              {vehicle.photoUrl ? <Image alt={vehicle.title} height={200} src={vehicle.photoUrl} width={360} /> : null}
              <h2>{vehicle.title}</h2>
              <p>{vehicle.description ?? vehicle.brand ?? ""}</p>
              <p>{vehicle.temperatureFrom}...{vehicle.temperatureTo} °C · {vehicle.payloadTonnes.toString()} т</p>
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
