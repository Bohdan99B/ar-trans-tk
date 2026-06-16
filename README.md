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

Email notifications are sent through Gmail SMTP via Nodemailer. Configure a Gmail App Password on the Google account and use it here; do not use the regular account password:

```env
GMAIL_SMTP_HOST="smtp.gmail.com"
GMAIL_SMTP_PORT="465"
GMAIL_SMTP_SECURE="true"
GMAIL_SMTP_USER="your-gmail-address@gmail.com"
GMAIL_SMTP_APP_PASSWORD="your-google-app-password"
MAIL_FROM="your-gmail-address@gmail.com"
MAIL_TO="company-recipient@gmail.com"
```

## Prisma migration

In source of project:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Production: creating the first OWNER

`OWNER` is the single bootstrap account with the same application access as `ADMIN` plus protection from employee deletion and administrator-generated password reset. It is created only by a manual server-side CLI command. There is no public registration endpoint and no deployment seed for this account.

Before creating the account:

1. Deploy all Prisma migrations to the production database:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. Open a protected shell/SSH session in the production runtime.
3. Confirm that `DATABASE_URL` points to the real production PostgreSQL database. The owner CLI has no fallback database URL.
4. Set these temporary, server-only environment variables:

   - `DATABASE_URL` - production PostgreSQL connection string.
   - `OWNER_EMAIL` - email used to sign in.
   - `OWNER_PASSWORD` - initial password, at least 10 characters.
   - `OWNER_NAME` - optional display name.

Do not put these variables in `NEXT_PUBLIC_*`, a Docker image, source control, CI logs, or a command-line argument. To avoid placing the password in shell history, read it silently:

```bash
export OWNER_EMAIL='owner@example.com'
export OWNER_NAME='Owner name'
read -s -p 'OWNER password: ' OWNER_PASSWORD
export OWNER_PASSWORD
printf '\n'
npm run owner:create
unset OWNER_PASSWORD OWNER_EMAIL OWNER_NAME
```

The command hashes the password with `bcryptjs` and cost factor `12`, the same mechanism used by sign-in, invitations, and password reset. It creates an `OWNER` only when no owner exists and the requested email is unused. It never prints the password.

Expected success output:

```text
OWNER created successfully: owner@example.com
```

Verify the database state with:

```bash
npm run owner:check
```

Then sign in through `/signin` and confirm access to the admin dashboard. `owner:check` must report exactly one `OWNER`.

### If an OWNER or user already exists

- If any `OWNER` already exists, `owner:create` exits with an error and makes no changes. Run `npm run owner:check`; do not create a second owner.
- If `OWNER_EMAIL` is already used by an `ADMIN` or `MANAGER`, the command exits without changing that user.
- For a deployment upgrading from the previous implementation, where the intended owner already exists as an `ADMIN`, set `OWNER_EMAIL` to that administrator and run `npm run owner:promote`. The command only promotes an existing password-enabled `ADMIN`, only when no `OWNER` exists, and does not change the password.

### Changing the OWNER email

Use the dedicated manual command; do not edit the row through the employee UI:

```bash
export OWNER_EMAIL='current-owner@example.com'
export OWNER_NEW_EMAIL='new-owner@example.com'
npm run owner:email:update
unset OWNER_EMAIL OWNER_NEW_EMAIL
npm run owner:check
```

The update requires exactly one owner, verifies the current email, and refuses an email already used by another user. Existing sessions should be signed out after the change, then the owner should sign in with the new email.

### Production restrictions

Never:

- add owner creation to migrations, application startup, Docker entrypoints, deployment hooks, or Prisma seed;
- use mock/test credentials or commit owner credentials to `.env`, README, source code, or container layers;
- pass the owner password as a CLI argument or expose it in logs;
- create or promote an owner through a frontend, public Route Handler, Server Action, or backdoor endpoint;
- change `OWNER` directly to another role or create multiple owners with ad hoc SQL;
- use `prisma migrate dev` against production.

## Developer notes: OWNER bootstrap

The responsible files are:

- `scripts/manage-owner.mjs` - manual create, check, promotion, and email-update operations;
- `prisma/schema.prisma` and `prisma/migrations/20260612120000_add_owner_role/migration.sql` - the `OWNER` role;
- `src/lib/owner-account.ts` and `src/lib/auth.ts` - role-based authorization;
- `package.json` - the public CLI command names.

To test locally, use a disposable local database, run `npx prisma migrate deploy`, set temporary `OWNER_*` variables, and run `npm run owner:create` followed by `npm run owner:check`. Run `owner:create` a second time and confirm that it fails without creating a duplicate. Test `owner:email:update` with an unused email and verify sign-in through `/signin`.

Keep all user creation out of seed data. Production migrations may seed non-sensitive reference/content rows, but must never insert users or credentials. When updating this documentation, verify every documented `npm run owner:*` command against `package.json`, keep examples fictional, and never paste values from a real `.env` file.
