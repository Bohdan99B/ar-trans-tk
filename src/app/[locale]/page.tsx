import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { OrderForm } from "@/components/forms/OrderForm";
import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { EuropeMap } from "@/components/sections/EuropeMap";
import { SectionIcon } from "@/components/sections/Icons";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";
import { TruckIllustration } from "@/components/sections/TruckIllustration";
import { prisma } from "@/lib/prisma";
import { getContentSettings, getPublicContacts, getSiteFaqs, getSiteRoutes, getSiteServices } from "@/lib/site-content";

import buttonStyles from "@/components/ui/Buttons.module.css";
import styles from "./Site.module.css";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [publishedReviews, services, routes, faqs, content, contacts, fleetTranslations] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, where: { moderationStatus: "PUBLISHED" } }),
    getSiteServices(locale),
    getSiteRoutes(),
    getSiteFaqs(locale),
    getContentSettings(),
    getPublicContacts(),
    getTranslations({ locale, namespace: "home.fleet" }),
  ]);
  const reviewItems = publishedReviews.map((review) => ({
    author: review.author,
    body: review.body,
    role: review.company ?? "Клієнт AR-TRANS",
  }));

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}>Логістика для бізнесу</p>
            <div className={styles.heroBadge}>
              <span>AR-TRANS</span>
              Україна • Європа
            </div>
            <h1 className={styles.title}>
              Надійна логістика для бізнесу по Україні та Європі
            </h1>
            <p className={styles.lead}>
              Організовуємо вантажні, міжнародні та рефрижераторні перевезення з контролем
              маршруту, термінів і безпеки вантажу.
            </p>
            <div className={buttonStyles.row}>
              <Link className={buttonStyles.primary} href={`/${locale}/order`}>
                Замовити перевезення
              </Link>
              <Link className={buttonStyles.secondary} href={`/${locale}/services`}>
                Дивитись послуги
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <b>20+</b>
                <span>років досвіду</span>
              </div>
              <div className={styles.stat}>
                <b>50+</b>
                <span>вантажівок</span>
              </div>
              <div className={styles.stat}>
                <b>24/7</b>
                <span>підтримка</span>
              </div>
              <div className={styles.stat}>
                <b>1000+</b>
                <span>доставок</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <TruckIllustration />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Про компанію</p>
          <h2 className={styles.heading}>{content["about.homeTitle"] || "Преміальна логістика без зайвої театральності"}</h2>
          <p className={styles.lead}>
            {content["about.homeText"] || "ПП «АР-Транс» засноване у 2002 році в Трускавці. Компанія працює з бізнесом, якому потрібні прогнозовані терміни, CMR-страхування, GPS-контроль, температурна дисципліна й менеджер, який тримає маршрут у фокусі."}
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Послуги</p>
          <h2 className={styles.heading}>Рішення для регулярних і міжнародних вантажів</h2>
          <div className={styles.grid}>
            {services.map((service) => (
              <Link className={styles.card} href={`/${locale}/services/${service.slug}`} key={service.slug}>
                <span className={styles.icon}><SectionIcon label={service.icon} /></span>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Географія перевезень</p>
            <h2 className={styles.heading}>Європейські маршрути з живим контролем рейсу</h2>
            <p className={styles.lead}>
              Будуємо маршрути по Україні та ключових напрямках Європи: експорт, імпорт,
              збірні партії та рефрижераторні перевезення з GPS-координацією.
            </p>
            <ul className={styles.routeList}>
              {routes.map((route) => (
                <li key={`${route.country}-${route.direction}`}>
                  <strong>{route.country}</strong>
                  <span>{route.destination}</span>
                </li>
              ))}
            </ul>
          </div>
          <EuropeMap />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.homeFleetOverview}>
            <div className={styles.homeFleetIntro}>
              <p className={styles.eyebrow}>{fleetTranslations("eyebrow")}</p>
              <h2 className={styles.heading}>{fleetTranslations("title")}</h2>
              <p className={styles.lead}>{fleetTranslations("description")}</p>
              <p className={styles.homeFleetText}>{fleetTranslations("trailers")}</p>
              <div className={buttonStyles.row}>
                <Link className={buttonStyles.primary} href={`/${locale}/fleet`}>
                  {fleetTranslations("cta")}
                </Link>
              </div>
            </div>
            <div className={styles.homeFleetHighlights}>
              <article className={`${styles.card} ${styles.homeFleetHighlight}`}>
                <strong>-20…+20 °C</strong>
                <span>{fleetTranslations("temperature")}</span>
              </article>
              <article className={`${styles.card} ${styles.homeFleetHighlight}`}>
                <strong>{fleetTranslations("payloadValue")}</strong>
                <span>{fleetTranslations("payload")}</span>
              </article>
              <article className={`${styles.card} ${styles.homeFleetHighlight}`}>
                <strong>GPS</strong>
                <span>{fleetTranslations("monitoring")}</span>
              </article>
              <article className={`${styles.card} ${styles.homeFleetHighlight}`}>
                <strong>{fleetTranslations("refrigeratorsValue")}</strong>
                <span>{fleetTranslations("refrigerators")}</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Співпраця</p>
            <h2 className={styles.heading}>Процес, у якому видно кожен наступний крок</h2>
            <ol className={styles.steps}>
              <li>Залишаєте заявку з маршрутом, вантажем, вагою та температурним режимом.</li>
              <li>Менеджер перевіряє доступність транспорту й погоджує ставку.</li>
              <li>Фіксуємо заявку, відстежуємо рейс і оновлюємо статус для клієнта.</li>
            </ol>
          </div>
          <div className={styles.card}>
            <p className={styles.eyebrow}>Страхування вантажу</p>
            <h3>Безпека вантажу, документи й контроль умов перевезення</h3>
            <p>
              Для міжнародних рейсів враховуємо документи, температурний режим,
              вимоги до пакування та часові вікна завантаження.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Для бізнесу</p>
          <h2 className={styles.heading}>Виробникам, дистриб&apos;юторам, експедиторам</h2>
          <div className={styles.grid}>
            <article className={styles.card}>
              <span className={styles.icon}>LTL</span>
              <h3>Збірні температурні вантажі</h3>
              <p>Планові об&apos;єднані рейси для клієнтів із регулярними поставками.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.icon}>%</span>
              <h3>Кредитування</h3>
              <p>Відстрочка платежу для постійних клієнтів після погодження умов.</p>
            </article>
            <article className={styles.card}>
              <span className={styles.icon}>CMR</span>
              <h3>Страхування до 550 000$</h3>
              <p>Документи, CMR-покриття та контроль ризиків для міжнародних перевезень.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Відгуки</p>
          <h2 className={styles.heading}>Довіра клієнтів — показник якості рейсу</h2>
          <ReviewsCarousel items={reviewItems} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.homeFaqLayout}`}>
          <div className={styles.homeFaqContent}>
            <p className={styles.eyebrow}>FAQ</p>
            <h2 className={styles.heading}>Питання / відповіді</h2>
            <div className={styles.homeFaqGrid}>
              {faqs.map((faq) => (
                <article className={`${styles.card} ${styles.homeFaqCard}`} key={faq.q}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className={styles.eyebrow}>Неробочий час</p>
            <h2 className={styles.heading}>Залиште контакт для менеджера</h2>
            <ContactCallbackForm />
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Готові до рейсу</p>
            <h2 className={styles.heading}>{content["cta.title"] || "Розрахуємо маршрут, ставку й доступність транспорту"}</h2>
            <p className={styles.lead}>
              {content["cta.text"] || "Опишіть вантаж, напрямок і часові вікна. Менеджер підбере формат перевезення та повернеться з конкретною пропозицією."}
            </p>
          </div>
          <div className={buttonStyles.row}>
            <Link className={buttonStyles.primary} href={`/${locale}/order`}>
              Замовити перевезення
            </Link>
            <Link className={buttonStyles.secondary} href={`/${locale}/contacts`}>
              Зв&apos;язатися з менеджером
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Форма заявки</p>
            <h2 className={styles.heading}>Отримати розрахунок перевезення</h2>
            <OrderForm />
          </div>
          <div>
            <p className={styles.eyebrow}>Наші контакти</p>
            <h2 className={styles.heading}>Підберемо маршрут і температурний режим</h2>
            <div className={styles.managerList}>
              {[contacts.office, contacts.director].map((contact) => (
                <article className={styles.manager} key={`${contact.name}-${contact.email}`}>
                  <h3>{contact.name}</h3>
                  <p>{contact.role}</p>
                  <p>{contact.phone}</p>
                  <p>{contact.email}</p>
                  {contact.hours ? <p>Години роботи: {contact.hours}</p> : null}
                  {contact.messengers.length ? (
                    <div className={styles.contactActions}>
                      {contact.messengers.map((messenger) => <span key={messenger}>{messenger}</span>)}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
