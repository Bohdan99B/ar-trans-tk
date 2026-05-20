# AR-Trans TC

Web app for transport company " AR-Trans "

## Stack

- Next.js App Router, TypeScript
- CSS Modules
- PostgreSQL, Prisma
- Auth.js / NextAuth з Prisma Adapter
- Nodemailer
- next-intl
- Cloudinary helpers
- Docker

## Local run

    npm run dev

## Docker

```bash
docker compose up --build
```

PostgreSQL is available on `localhost:5433`.

## Env

Setup environment variables
DATABASE_URL=postgresql...

## Prisma migration

In source of project:

```bash
npx prisma migrate deploy
npx prisma generate
```
