# AR Trans TK

Next.js full-stack застосунок для транспортної компанії, що спеціалізується на рефрижераторних перевезеннях фурами до 22 тонн.

## Стек

- Next.js App Router, TypeScript
- CSS Modules без Tailwind
- PostgreSQL, Prisma
- Auth.js / NextAuth з Prisma Adapter
- Nodemailer
- next-intl
- Cloudinary helpers
- Docker

## Запуск локально

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
npx prisma studio
```

Сайт відкриється на `http://localhost:3000/uk`.

## Docker

```bash
docker compose up --build
```

PostgreSQL у Docker доступний на `localhost:5433`.

## Env

Скопіюйте `.env.example` у `.env` та заповніть `DATABASE_URL`, `NEXTAUTH_SECRET`, SMTP і Cloudinary змінні за потреби.

Cloudinary змінні необов'язкові для публічних сторінок. Якщо SMTP не налаштований, заявки все одно зберігаються в базі.

## Адмін

Адмінка доступна за `/uk/admin` після входу через NextAuth Credentials provider. Створіть адміністратора в базі з `passwordHash` bcrypt.
