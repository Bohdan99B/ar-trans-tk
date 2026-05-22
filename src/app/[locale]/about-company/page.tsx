import Link from "next/link";
import type { Metadata } from "next";

import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { SectionIcon } from "@/components/sections/Icons";
import { TemperatureDashboard } from "@/components/sections/TemperatureDashboard";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "../Site.module.css";

type AboutCompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Про компанію | AR-TRANS",
  description:
    "ПП «АР-Транс» — українська транспортно-логістична компанія з Трускавця, заснована у 2002 році. Міжнародні, внутрішні та рефрижераторні перевезення.",
};

const milestones = [
  ["2002", "Заснування компанії у місті Трускавець."],
  ["2008", "Вступ до АсМАП України та підтвердження міжнародних стандартів роботи."],
  ["Міжнародний розвиток", "Розширення напрямків перевезень між Україною та країнами Європи."],
  ["Рефрижераторний напрямок", "Фокус на вантажах, що потребують температурного режиму."],
  ["Сучасний автопарк", "Volvo FH, Euro-6, Schmitz Cargobull, GPS та оперативний контроль."],
  ["Європа", "Регулярна робота по ключових країнах Європи з особливим акцентом на Італію."],
];

const advantages = [
  ["20+ років досвіду", "Стабільна експертиза у внутрішніх і міжнародних вантажних перевезеннях."],
  ["50+ вантажівок", "Власний автопарк для регулярних маршрутів і температурної логістики."],
  ["GPS контроль", "Моніторинг транспорту у реальному часі протягом усього рейсу."],
  ["Рефрижератори", "Двокамерні напівпричепи для різних температурних зон."],
  ["Міжнародна логістика", "Маршрути, документи, страхування та митна координація."],
  ["CMR страхування", "Покриття вантажів до 550 000$."],
];

export default async function AboutCompanyPage({ params }: AboutCompanyPageProps) {
  const { locale } = await params;

  return (
    <>
      <section className={styles.mediaHero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>ПП «АР-Транс»</p>
          <h1 className={styles.title}>Транспортно-логістична компанія з європейським рівнем контролю</h1>
          <p className={styles.lead}>
            Понад 20 років ми забезпечуємо міжнародні та внутрішні вантажні перевезення,
            поєднуючи власний автопарк, рефрижераторні технології та персональну комунікацію.
          </p>
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>
              Замовити перевезення
            </Link>
            <Link className={buttonStyles.secondary} href={`/${locale}/fleet`}>
              Переглянути автопарк
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.richText}>
            <p>
              ПП «АР-Транс» — українська транспортно-логістична компанія, заснована у 2002 році
              у місті Трускавець. Уже понад 20 років компанія забезпечує надійні міжнародні та
              внутрішні вантажні перевезення, поєднуючи сучасний автопарк, європейські стандарти
              роботи та індивідуальний підхід до кожного клієнта.
            </p>
            <p>
              У 2008 році компанія стала членом АсМАП України, що підтверджує відповідність
              міжнародним вимогам та стандартам у сфері автомобільних перевезень.
            </p>
            <p>
              Основою діяльності ПП «АР-Транс» є безпечна, своєчасна та контрольована доставка
              вантажів по Україні та країнах Європи. Компанія спеціалізується на рефрижераторних
              перевезеннях, міжнародній логістиці та перевезенні вантажів, що потребують
              дотримання температурного режиму.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.icon}><SectionIcon label="CMR" /></span>
            <h2>Документи та страхування</h2>
            <ul>
              <li>міжнародні ліцензії та дозволи;</li>
              <li>ADR-допуски для перевезення небезпечних вантажів;</li>
              <li>книжки ЄКМТ/CEMT;</li>
              <li>усі необхідні страхові сертифікати;</li>
              <li>CMR-страхування вантажів до 550 000$.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Досвід</p>
            <h2 className={styles.heading}>Від локальної компанії до європейської логістики</h2>
            <div className={styles.timeline}>
              {milestones.map(([year, text]) => (
                <article key={year}>
                  <strong>{year}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
          <TemperatureDashboard />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Переваги</p>
          <h2 className={styles.heading}>Контроль, який відчувається у кожному рейсі</h2>
          <div className={`${styles.grid} ${styles.gridThree}`}>
            {advantages.map(([title, text]) => (
              <article className={styles.card} key={title}>
                <span className={styles.icon}><SectionIcon label={title.includes("GPS") ? "GPS" : "TRUCK"} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Технології</p>
            <h2 className={styles.heading}>GPS, температурний контроль і зв&apos;язок без темних зон</h2>
            <div className={styles.richText}>
              <p>
                Компанія активно впроваджує сучасні технології контролю перевезень:
                GPS-моніторинг транспорту у реальному часі, онлайн-контроль температури у
                рефрижераторах, контроль маршрутів і постійний зв&apos;язок з водіями та менеджерами.
              </p>
              <p>
                ПП «АР-Транс» — це поєднання багаторічного досвіду, сучасної логістики та
                відповідального підходу до перевезень по всій Європі.
              </p>
            </div>
          </div>
          <div className={styles.featureGrid}>
            {[
              "GPS-відстеження",
              "Температурний контроль",
              "Моніторинг маршруту",
              "Системи комунікації",
            ].map((item) => (
              <article className={styles.card} key={item}>
                <span className={styles.icon}><SectionIcon label={item.includes("GPS") ? "GPS" : "LIVE"} /></span>
                <h3>{item}</h3>
                <p>Операційний контроль, який допомагає тримати вантаж, маршрут і клієнта в одному інформаційному контурі.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>CTA</p>
            <h2 className={styles.heading}>Підберемо транспорт, маршрут і температурний режим</h2>
            <FaqAccordion locale={locale} />
          </div>
          <ContactCallbackForm />
        </div>
      </section>
    </>
  );
}
