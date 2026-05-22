<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project-specific Next.js notes

This project is not unusual because it uses CSS Modules. CSS Modules are an official, normal styling approach in Next.js, and Tailwind CSS is not required.

The important Next.js-specific details are:

- The app uses Next.js 16.2.6 with the App Router under `src/app`, not the legacy Pages Router.
- Routes are built with `layout.tsx`, `page.tsx`, and `route.ts` files.
- The project uses `src/proxy.ts` for request proxy logic. In Next.js 16, Middleware is now called Proxy.
- Dynamic route `params` may be promises and should be awaited where used, for example in locale layouts.
- Internationalized routing is handled with `next-intl` through `src/app/[locale]`, `src/i18n/routing.ts`, and the `next-intl` plugin in `next.config.ts`.
- The app also includes Prisma, PostgreSQL, NextAuth/Auth.js, Nodemailer, Cloudinary helpers, and Docker, so it is more than a freshly generated starter even though the core Next.js structure is conventional.

Before changing Next.js behavior, check the local Next.js 16 documentation in `node_modules/next/dist/docs/` instead of relying on older Next.js examples.

<!-- END:nextjs-agent-rules -->
