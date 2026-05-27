import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { OfficeMap } from "@/components/sections/OfficeMap";
import { PageHero } from "@/components/sections/PageHero";
import { getPublicContacts, type PublicContact } from "@/lib/site-content";

import styles from "../Site.module.css";

export default async function ContactsPage() {
  const { additionalContacts, director, office } = await getPublicContacts();
  const contacts = [office, director, ...additionalContacts];

  return (
    <>
      <PageHero
        eyebrow="Контакти"
        text="Зв'яжіться з менеджером або директором для розрахунку маршруту, температурного режиму, партнерських умов та доступності транспорту."
        title="Контакти ПП «АР-Транс»"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.contactsLayout}`}>
          <div className={styles.contactCardGrid}>
            {contacts.map((contact) => <ContactCard contact={contact} key={`${contact.name}-${contact.email}`} />)}
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

function ContactCard({ contact }: { contact: PublicContact }) {
  const phone = contact.phone.replaceAll(/[^+\d]/g, "");

  return (
    <article className={styles.manager}>
      <h2>{contact.name}</h2>
      <p>{contact.role}</p>
      <p><a className={styles.contactTextLink} href={`tel:${phone}`}>{contact.phone}</a></p>
      <p><a className={styles.contactTextLink} href={`mailto:${contact.email}`}>{contact.email}</a></p>
      {contact.hours ? <p>Години роботи: {contact.hours}</p> : null}
      {contact.messengers.length ? (
        <div className={styles.contactActions}>
          {contact.messengers.map((messenger) => <span key={messenger}>{messenger}</span>)}
        </div>
      ) : null}
    </article>
  );
}
