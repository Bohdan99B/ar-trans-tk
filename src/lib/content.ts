export type Locale = "uk" | "en";

export const defaultLocale: Locale = "uk";

export const navItems = [
  { href: "services", uk: "Послуги", en: "Services" },
  { href: "fleet", uk: "Автопарк", en: "Fleet" },
  { href: "geography", uk: "Географія", en: "Geography" },
  { href: "reviews", uk: "Відгуки", en: "Reviews" },
  { href: "contacts", uk: "Контакти", en: "Contacts" },
] as const;

export const managers = [
  {
    name: "Олена Коваль",
    role: "Менеджерка з міжнародних перевезень",
    phone: "+380 (67) 120-45-88",
    email: "sales@ar-trans-tk.ua",
  },
  {
    name: "Андрій Мельник",
    role: "Менеджер по Україні",
    phone: "+380 (50) 410-22-19",
    email: "dispatch@ar-trans-tk.ua",
  },
];

export const services = [
  {
    slug: "refrigerated-transport",
    icon: "❄",
    titleUk: "Рефрижераторні перевезення до 22 т",
    titleEn: "Refrigerated transport up to 22 t",
    summaryUk: "Температурний режим від -20 до +20 C для харчових, фармацевтичних та інших чутливих вантажів.",
    summaryEn: "Temperature-controlled freight from -20 to +20 C for food, pharma and sensitive cargo.",
  },
  {
    slug: "international-transport",
    icon: "EU",
    titleUk: "Міжнародні перевезення",
    titleEn: "International transport",
    summaryUk: "Експорт та імпорт між Україною, Італією, Іспанією, Молдовою, Австрією, Чехією, Угорщиною та Францією.",
    summaryEn: "Export and import between Ukraine, Italy, Spain, Moldova, Austria, Czechia, Hungary and France.",
  },
  {
    slug: "groupage-cargo",
    icon: "LTL",
    titleUk: "Збірні вантажі для постійних клієнтів",
    titleEn: "Groupage cargo for regular clients",
    summaryUk: "Консолідація температурних вантажів за погодженим графіком для постійних клієнтів.",
    summaryEn: "Consolidated refrigerated cargo on an agreed schedule for regular clients.",
  },
  {
    slug: "client-credit",
    icon: "%",
    titleUk: "Кредитування для постійних клієнтів",
    titleEn: "Credit terms for regular clients",
    summaryUk: "Гнучкі умови оплати після погодження лімітів та історії співпраці.",
    summaryEn: "Flexible payment terms after agreed limits and cooperation history.",
  },
];

export const routes = [
  { country: "Україна", destination: "З центру України на захід", direction: "UA-WEST" },
  { country: "Італія", destination: "Експорт / імпорт", direction: "EU" },
  { country: "Іспанія", destination: "Експорт / імпорт", direction: "EU" },
  { country: "Молдова", destination: "Експорт / імпорт", direction: "MD" },
  { country: "Австрія", destination: "Експорт / імпорт", direction: "EU" },
  { country: "Чехія", destination: "Експорт / імпорт", direction: "EU" },
  { country: "Угорщина", destination: "Експорт / імпорт", direction: "EU" },
  { country: "Франція", destination: "Експорт / імпорт", direction: "EU" },
];

export const fleet = [
  {
    title: "Тентований рефрижератор 22 т",
    details: "86-92 м3, GPS, реєстратор температури",
    temp: "-20 C ... +20 C",
  },
  {
    title: "Рефрижератор для палетних вантажів",
    details: "33 європалети, санітарна підготовка кузова",
    temp: "-18 C ... +18 C",
  },
  {
    title: "Автопоїзд для регулярних маршрутів",
    details: "Планові рейси Україна - ЄС для постійних клієнтів",
    temp: "0 C ... +8 C",
  },
];

export const faqs = [
  {
    q: "Які вантажі ви перевозите?",
    a: "Ми працюємо з температурними вантажами: продукти харчування, заморожені товари, фармацевтика, сировина та інші вантажі, що потребують контрольованого режиму.",
  },
  {
    q: "Чи можна перевірити статус заявки?",
    a: "Так. Після створення заявки клієнт отримує номер. Статус можна перевірити на сторінці /status за номером заявки та email або телефоном.",
  },
  {
    q: "Чи працюєте зі збірними вантажами?",
    a: "Так, але тільки для постійних клієнтів за погодженим графіком і вимогами до температурного режиму.",
  },
];

export const reviews = [
  {
    author: "Fresh Market",
    body: "Стабільно тримають температурний режим і швидко реагують на зміни по маршруту.",
  },
  {
    author: "Food Export UA",
    body: "Працюємо по Італії та Чехії. Документи, комунікація й статуси без зайвого шуму.",
  },
];

export function pick(locale: string, uk: string, en: string) {
  return locale === "en" ? en : uk;
}
