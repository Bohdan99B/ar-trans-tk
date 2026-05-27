INSERT INTO "Service" ("id", "slug", "titleUk", "titleEn", "summaryUk", "summaryEn", "bodyUk", "bodyEn", "isPublished", "createdAt", "updatedAt")
SELECT *
FROM (VALUES
  ('seed-service-refrigerated', 'refrigerated-transport', 'Рефрижераторні перевезення 20-23 т', 'Refrigerated transport 20-23 t', 'Рефрижератори, стабільний температурний режим, моніторинг температури у режимі поточного часу і звітність для кожного типу продукції.', 'Dual-zone refrigerated trailers, stable temperature control, live monitoring and reports for food, medical and pharma cargo.', 'Рефрижераторні перевезення зі стабільним температурним режимом і звітністю.', 'Refrigerated transportation with stable temperature control and reporting.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-international', 'international-transport', 'Міжнародні перевезення', 'International transport', 'Оптимальні маршрути по Європі, митний супровід, документація, страхування та контроль доставки від завантаження до розвантаження.', 'Optimized European routes, customs support, documentation, insurance and delivery control.', 'Міжнародні перевезення з контролем маршруту та документів.', 'International transportation with route and document control.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-ukraine', 'ukraine-transport', 'Внутрішні перевезення по Україні', 'Domestic transport in Ukraine', 'Регулярні рейси Україною для виробників, дистриб''юторів і мереж з контролем графіка, маршруту та стану вантажу.', 'Domestic freight across Ukraine for producers, distributors and retail networks.', 'Внутрішні перевезення для регулярних поставок.', 'Domestic transportation for regular supply chains.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-groupage', 'groupage-cargo', 'Збірні вантажі', 'Groupage cargo for regular clients', 'Консолідація вантажів за погодженим графіком для клієнтів із сумісними температурними режимами та регулярними поставками.', 'Consolidated refrigerated cargo on an agreed schedule for regular clients.', 'Консолідація вантажів за погодженим графіком.', 'Cargo consolidation on an agreed schedule.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-insurance', 'cargo-insurance', 'Страхування вантажів', 'Cargo insurance', 'CMR-страхування вантажів до 550 000$ та контроль документів для міжнародних і внутрішніх перевезень.', 'CMR cargo insurance up to $550,000 and document control.', 'Страхування і контроль документів.', 'Insurance and document control.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-credit', 'client-credit', 'Кредитування та партнерські умови', 'Credit terms for regular clients', 'Гнучкі умови оплати після погодження лімітів та історії співпраці.', 'Flexible payment terms after agreed limits and cooperation history.', 'Партнерські умови для постійних клієнтів.', 'Terms for regular clients.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-gps', 'gps-tracking', 'GPS-відстеження', 'GPS tracking', 'Сучасні системи GPS-моніторингу забезпечують повний контроль перевезень у режимі реального часу.', 'Modern GPS monitoring systems provide real-time transport control.', 'GPS-моніторинг рейсів.', 'GPS shipment monitoring.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-service-temperature', 'temperature-reporting', 'Температурна звітність та оперативний контроль', 'Temperature reporting and live control', 'Постійний моніторинг температури, температурні звіти, відстеження маршруту та контроль стабільності показників для чутливих вантажів.', 'Live temperature monitoring, reports, route tracking and stability indicators.', 'Температурні звіти для чутливих вантажів.', 'Temperature reporting for sensitive cargo.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS defaults ("id", "slug", "titleUk", "titleEn", "summaryUk", "summaryEn", "bodyUk", "bodyEn", "isPublished", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Service");

INSERT INTO "GeographyRoute" ("id", "origin", "destination", "country", "direction", "isActive", "createdAt", "updatedAt")
SELECT *
FROM (VALUES
  ('seed-route-it', 'Україна', 'Ключовий напрямок експорту та імпорту', 'Італія', 'IT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-de', 'Україна', 'Регулярні європейські рейси', 'Німеччина', 'DE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-fr', 'Україна', 'Температурні вантажі та збірні партії', 'Франція', 'FR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-es', 'Україна', 'Дальні маршрути з GPS-контролем', 'Іспанія', 'ES', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-be', 'Україна', 'Рейси для торгових і логістичних партнерів', 'Бельгія', 'BE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-nl', 'Україна', 'Імпорт, експорт, мультимодальна логістика', 'Нідерланди', 'NL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-cz', 'Україна', 'Стабільні маршрути Центральною Європою', 'Чехія', 'CZ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-at', 'Україна', 'Транзитні та прямі рейси', 'Австрія', 'AT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-route-ua', 'Україна', 'Внутрішні перевезення та міжнародний старт', 'Україна', 'UA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS defaults ("id", "origin", "destination", "country", "direction", "isActive", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "GeographyRoute");

INSERT INTO "FaqItem" ("id", "questionUk", "questionEn", "answerUk", "answerEn", "sortOrder", "isPublished", "createdAt", "updatedAt")
SELECT *
FROM (VALUES
  ('seed-faq-cargo', 'Які вантажі ви перевозите?', 'What cargo do you transport?', 'Продукти харчування, молочну продукцію, м''ясо, рибу, медикаменти, фармацевтичну продукцію, збірні партії та інші вантажі, що потребують контролю умов перевезення.', 'Food, dairy, meat, fish, medicine, pharmaceutical products and other cargo requiring controlled transport conditions.', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-faq-countries', 'Які країни обслуговуєте?', 'Which countries do you serve?', 'Працюємо по всій Європі з особливим фокусом на Італію, а також Німеччину, Францію, Іспанію, Бельгію, Нідерланди, Чехію, Австрію та інші країни.', 'We work throughout Europe with a special focus on Italy and key European destinations.', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-faq-insurance', 'Чи є страхування?', 'Is cargo insurance available?', 'Так. Компанія має всі необхідні страхові сертифікати та CMR-страхування вантажів до 550 000$.', 'Yes. The company provides the required insurance certificates and CMR cargo coverage up to $550,000.', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-faq-time', 'Які терміни доставки?', 'What are the delivery times?', 'Терміни залежать від маршруту, митних процедур, температурного режиму та вікон завантаження. Менеджер розраховує графік після отримання заявки.', 'Delivery times depend on route, customs procedures, temperature requirements and loading windows.', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS defaults ("id", "questionUk", "questionEn", "answerUk", "answerEn", "sortOrder", "isPublished", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem");
