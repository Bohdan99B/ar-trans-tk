import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { OfficeMap } from "@/components/sections/OfficeMap";
import { PageHero } from "@/components/sections/PageHero";
import { managers } from "@/lib/content";
import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

export default async function ContactsPage() {
  const settings = Object.fromEntries((await prisma.siteSetting.findMany({
    where: { key: { in: ["contact.phones", "contact.email", "contact.address", "contact.hours"] } },
  })).map(({ key, value }) => [key, value]));
  const contacts = settings["contact.phones"] || settings["contact.email"] ? [{
    email: settings["contact.email"] || "sales@ar-trans-tk.ua",
    name: "ПП «АР-Транс»",
    phone: settings["contact.phones"]?.split(/\r?\n|,/)[0]?.trim() || "+380 (67) 120-45-88",
    role: [settings["contact.address"], settings["contact.hours"]].filter(Boolean).join(" · ") || "Контактний центр",
  }] : managers;

  return (
    <>
      <PageHero
        eyebrow="Контакти"
        text="Зв'яжіться з менеджером або директором для розрахунку маршруту, температурного режиму, партнерських умов та доступності транспорту."
        title="Контакти ПП «АР-Транс»"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.managerList}>
            {contacts.map((manager) => (
              <article className={styles.manager} key={manager.email}>
                <h2>{manager.name}</h2>
                <p>{manager.role}</p>
                <p>{manager.phone}</p>
                <p>{manager.email}</p>
                <div className={styles.contactActions}>
                  <a href={`tel:${manager.phone.replaceAll(" ", "").replaceAll("(", "").replaceAll(")", "").replaceAll("-", "")}`}>Phone</a>
                  <a href={`mailto:${manager.email}`}>Email</a>
                  <a href="https://t.me/" rel="noreferrer" target="_blank">Telegram</a>
                  <a href="viber://chat?number=%2B380671204588">Viber</a>
                  <a href="https://wa.me/380671204588" rel="noreferrer" target="_blank">WhatsApp</a>
                </div>
              </article>
            ))}
          </div>
          <ContactCallbackForm />
        </div>
      </section>
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Карта офісу</p>
            <h2 className={styles.heading}>Трускавець, Львівська область</h2>
            <p className={styles.lead}>
              Офіс компанії розташований у Трускавці. Карта завантажується ліниво та показує
              marker локації без важких сторонніх скриптів.
            </p>
          </div>
          <OfficeMap />
        </div>
      </section>
    </>
  );
}
