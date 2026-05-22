export type Locale = "uk" | "en";

export const defaultLocale: Locale = "uk";

export const navItems = [
  { href: "about-company", uk: "Про компанію", en: "About" },
  { href: "services", uk: "Послуги", en: "Services" },
  { href: "fleet", uk: "Автопарк", en: "Fleet" },
  { href: "geography", uk: "Географія", en: "Geography" },
  { href: "reviews", uk: "Відгуки", en: "Reviews" },
  { href: "contacts", uk: "Контакти", en: "Contacts" },
] as const;

export const managers = [
  {
    name: "Менеджер ПП «АР-Транс»",
    role: "Логістика, розрахунок рейсів, комунікація з клієнтами",
    phone: "+380 (67) 120-45-88",
    email: "sales@ar-trans-tk.ua",
  },
  {
    name: "Директор ПП «АР-Транс»",
    role: "Партнерські умови, стратегічні маршрути, регулярна співпраця",
    phone: "+380 (67) 120-45-88",
    email: "office@ar-trans-tk.ua",
  },
];

export const services = [
  {
    slug: "refrigerated-transport",
    icon: "TEMP",
    titleUk: "Рефрижераторні перевезення 20-23 т",
    titleEn: "Refrigerated transport 20-23 t",
    summaryUk: "Рефрижератори, стабільний температурний режим, моніторинг температури у режимі поточного часу і звітність для кожного типу продукції.",
    summaryEn: "Dual-zone refrigerated trailers, stable temperature control, live monitoring and reports for food, medical and pharma cargo.",
    bulletsUk: ["Двокамерні зони", "Температурний контроль", "Live monitoring"],
  },
  {
    slug: "international-transport",
    icon: "EU",
    titleUk: "Міжнародні перевезення",
    titleEn: "International transport",
    summaryUk: "Оптимальні маршрути по Європі, митний супровід, документація, страхування та контроль доставки від завантаження до розвантаження.",
    summaryEn: "Optimized European routes, customs support, documentation, insurance and delivery control.",
    bulletsUk: ["Митний супровід", "Документація", "Контроль доставки"],
  },
  {
    slug: "ukraine-transport",
    icon: "UA",
    titleUk: "Внутрішні перевезення по Україні",
    titleEn: "Domestic transport in Ukraine",
    summaryUk: "Регулярні рейси Україною для виробників, дистриб'юторів і мереж з контролем графіка, маршруту та стану вантажу.",
    summaryEn: "Domestic freight across Ukraine for producers, distributors and retail networks.",
    bulletsUk: ["Швидке планування", "Контроль маршруту", "Рефрижераторні рейси"],
  },
  {
    slug: "groupage-cargo",
    icon: "LTL",
    titleUk: "Збірні вантажі",
    titleEn: "Groupage cargo for regular clients",
    summaryUk: "Консолідація вантажів за погодженим графіком для клієнтів із сумісними температурними режимами та регулярними поставками.",
    summaryEn: "Consolidated refrigerated cargo on an agreed schedule for regular clients.",
    bulletsUk: ["Планові рейси", "Сумісні режими", "Контроль партій"],
  },
  {
    slug: "cargo-insurance",
    icon: "CMR",
    titleUk: "Страхування вантажів",
    titleEn: "Cargo insurance",
    summaryUk: "CMR-страхування вантажів до 550 000$ та контроль документів для міжнародних і внутрішніх перевезень.",
    summaryEn: "CMR cargo insurance up to $550,000 and document control.",
    bulletsUk: ["CMR до 550 000$", "Документи", "Безпека вантажу"],
  },
  {
    slug: "client-credit",
    icon: "%",
    titleUk: "Кредитування та партнерські умови",
    titleEn: "Credit terms for regular clients",
    summaryUk: "Гнучкі умови оплати після погодження лімітів та історії співпраці.",
    summaryEn: "Flexible payment terms after agreed limits and cooperation history.",
    bulletsUk: ["Індивідуальні ліміти", "Регулярні рейси", "Партнерська модель"],
  },
  {
    slug: "gps-tracking",
    icon: "GPS",
    titleUk: "GPS-відстеження",
    titleEn: "GPS tracking",
    summaryUk: "Сучасні системи GPS-моніторингу забезпечують повний контроль перевезень у режимі реального часу.",
    summaryEn: "Modern GPS monitoring systems provide real-time transport control.",
    bulletsUk: ["Live позиція", "Маршрут", "Менеджерський контроль"],
  },
  {
    slug: "temperature-reporting",
    icon: "LIVE",
    titleUk: "Температурна звітність та оперативний контроль",
    titleEn: "Temperature reporting and live control",
    summaryUk: "Постійний моніторинг температури, температурні звіти, відстеження маршруту та контроль стабільності показників для чутливих вантажів.",
    summaryEn: "Live temperature monitoring, reports, route tracking and stability indicators.",
    bulletsUk: ["Температурні звіти", "Відстеження маршруту", "Контроль стабільності"],
  },
];

export const routes = [
  { country: "Італія", destination: "Ключовий напрямок експорту та імпорту", direction: "IT" },
  { country: "Німеччина", destination: "Регулярні європейські рейси", direction: "DE" },
  { country: "Франція", destination: "Температурні вантажі та збірні партії", direction: "FR" },
  { country: "Іспанія", destination: "Дальні маршрути з GPS-контролем", direction: "ES" },
  { country: "Бельгія", destination: "Рейси для торгових і логістичних партнерів", direction: "BE" },
  { country: "Нідерланди", destination: "Імпорт, експорт, мультимодальна логістика", direction: "NL" },
  { country: "Чехія", destination: "Стабільні маршрути Центральною Європою", direction: "CZ" },
  { country: "Австрія", destination: "Транзитні та прямі рейси", direction: "AT" },
  { country: "Україна", destination: "Внутрішні перевезення та міжнародний старт", direction: "UA" },
];

export const fleet = [
  {
    title: "Volvo FH Euro-6",
    details: "Сучасні тягачі для міжнародних маршрутів, стабільної швидкості та економної роботи на довгих дистанціях.",
    temp: "20-23 т",
  },
  {
    title: "Schmitz Cargobull",
    details: "Рефрижераторні напівпричепи з точним охолодженням, двокамерними зонами та контролем температури.",
    temp: "-20 C ... +20 C",
  },
  {
    title: "Понад 50 вантажних автомобілів",
    details: "Власний автопарк із GPS, плановим технічним обслуговуванням, страховими документами та екологічними стандартами.",
    temp: "Euro-6 / GPS / CMR",
  },
];

export const faqs = [
  {
    q: "Які вантажі ви перевозите?",
    a: "Продукти харчування, молочну продукцію, м'ясо, рибу, медикаменти, фармацевтичну продукцію, збірні партії та інші вантажі, що потребують контролю умов перевезення.",
    href: "services/refrigerated-transport",
  },
  {
    q: "Які країни обслуговуєте?",
    a: "Працюємо по всій Європі з особливим фокусом на Італію, а також Німеччину, Францію, Іспанію, Бельгію, Нідерланди, Чехію, Австрію та інші країни.",
    href: "geography",
  },
  {
    q: "Чи є страхування?",
    a: "Так. Компанія має всі необхідні страхові сертифікати та CMR-страхування вантажів до 550 000$.",
    href: "services/cargo-insurance",
  },
  {
    q: "Які терміни доставки?",
    a: "Терміни залежать від маршруту, митних процедур, температурного режиму та вікон завантаження. Менеджер розраховує графік після отримання заявки.",
    href: "order",
  },
];

export const reviews = [
  {
    author: "Fresh Market",
    role: "Харчова дистрибуція",
    body: "Довіра тримається на стабільності: рейси приходять у погоджені вікна, менеджер на зв'язку, температурний режим підтверджується без зайвих нагадувань.",
  },
  {
    author: "Food Export UA",
    role: "Експорт продуктів",
    body: "Працюємо по Італії та Центральній Європі. Цінуємо контроль вантажу, професійність водіїв і чітку роботу з документами.",
  },
  {
    author: "Pharma Logistics Partner",
    role: "Температурна логістика",
    body: "Для чутливих вантажів важливі не обіцянки, а звітність і дисципліна маршруту. AR-Trans дає саме це: контроль, комунікацію і стабільність.",
  },
  {
    author: "Retail Supply Group",
    role: "Регулярні поставки",
    body: "Індивідуальний підхід відчувається в деталях: швидко узгоджують рейси, попереджають про зміни й не гублять контекст між заявками.",
  },
];

export function pick(locale: string, uk: string, en: string) {
  return locale === "en" ? en : uk;
}
