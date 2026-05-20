import Link from "next/link";

import { OrderForm } from "@/components/forms/OrderForm";
import { ContactCallbackForm } from "@/components/forms/ContactCallbackForm";
import { RouteMap } from "@/components/sections/RouteMap";
import { TruckIllustration } from "@/components/sections/TruckIllustration";
import { faqs, fleet, managers, reviews, routes, services } from "@/lib/content";

import buttonStyles from "@/components/ui/Buttons.module.css";
import styles from "./Site.module.css";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>AR-TRANS</span>
              Україна • Європа • температурний контроль
            </div>
            <p className={styles.eyebrow}>Логістика для бізнесу</p>
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
                <b>10+</b>
                <span>років досвіду</span>
              </div>
              <div className={styles.stat}>
                <b>25+</b>
                <span>напрямків</span>
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
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>Про компанію</p>
            <h2 className={styles.heading}>Преміальна логістика без зайвої театральності</h2>
            <p className={styles.lead}>
              Працюємо з бізнесом, якому потрібні прогнозовані терміни, зрозуміла ставка,
              контроль доставки й менеджер, який тримає маршрут у фокусі від заявки до
              розвантаження.
            </p>
          </div>
          <OrderForm compact />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Послуги</p>
          <h2 className={styles.heading}>Рішення для регулярних і міжнародних вантажів</h2>
          <div className={styles.grid}>
            {services.map((service) => (
              <Link className={styles.card} href={`/${locale}/services/${service.slug}`} key={service.slug}>
                <span className={styles.icon}>{service.icon}</span>
                <h3>{service.titleUk}</h3>
                <p>{service.summaryUk}</p>
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
          <RouteMap />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Автопарк</p>
          <h2 className={styles.heading}>Червоний тягач і білий рефрижератор як робочий стандарт</h2>
          <div className={styles.split}>
            <TruckIllustration compact />
            <div className={styles.grid}>
              {fleet.map((vehicle) => (
                <article className={styles.card} key={vehicle.title}>
                  <span className={styles.icon}>22T</span>
                  <h3>{vehicle.title}</h3>
                  <p>{vehicle.details}</p>
                  <p>{vehicle.temp}</p>
                </article>
              ))}
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
            {reviews.map((review) => (
              <article className={styles.card} key={review.author}>
                <span className={styles.icon}>“</span>
                <h3>{review.author}</h3>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>FAQ</p>
            <h2 className={styles.heading}>Питання / відповіді</h2>
            <div className={styles.grid}>
              {faqs.map((faq) => (
                <article className={styles.card} key={faq.q}>
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
            <h2 className={styles.heading}>Розрахуємо маршрут, ставку й доступність транспорту</h2>
            <p className={styles.lead}>
              Опишіть вантаж, напрямок і часові вікна. Менеджер підбере формат перевезення та
              повернеться з конкретною пропозицією.
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
            <p className={styles.eyebrow}>Контакти менеджерів</p>
            <h2 className={styles.heading}>Підберемо маршрут і температурний режим</h2>
            <div className={styles.managerList}>
              {managers.map((manager) => (
                <article className={styles.manager} key={manager.email}>
                  <h3>{manager.name}</h3>
                  <p>{manager.role}</p>
                  <p>{manager.phone}</p>
                  <p>{manager.email}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
