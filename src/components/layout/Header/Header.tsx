import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { getCurrentUser } from "@/lib/auth";
import { navItems } from "@/lib/content";
import { isAdminRole } from "@/lib/owner-account";
import { prisma } from "@/lib/prisma";

import styles from "./Header.module.css";

type HeaderProps = {
  locale: string;
};

const headerNavItems = navItems.filter((item) => item.href !== "reviews");

export async function Header({ locale }: HeaderProps) {
  const [user, settings] = await Promise.all([
    getCurrentUser(),
    prisma.siteSetting.findMany({ where: { key: { in: ["brand.logo", "contact.phones"] } } }),
  ]);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  const phone = values["contact.phones"]?.split(/\r?\n|,/)[0]?.trim() || "+380 (67) 120-45-88";
  const managementHref =
    user && isAdminRole(user.role)
      ? `/${locale}/admin`
      : user?.role === "MANAGER"
        ? `/${locale}/manager`
        : null;
  const isUkrainian = locale === "uk";
  const navigationLabel = isUkrainian ? "Основна навігація" : "Primary navigation";

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={`/${locale}`}>
        <Logo imageUrl={values["brand.logo"]} />
      </Link>
      <details className={styles.menu}>
        <summary aria-label={isUkrainian ? "Відкрити меню" : "Open menu"}>
          <span />
          <span />
          <span />
        </summary>
        <nav className={styles.nav} aria-label={navigationLabel}>
          {headerNavItems.map((item) => (
            <Link key={item.href} href={`/${locale}/${item.href}`}>
              {locale === "en" ? item.en : item.uk}
            </Link>
          ))}
          {managementHref ? <Link href={managementHref}>{isUkrainian ? "Панель керування" : "Management"}</Link> : null}
        </nav>
      </details>
      <nav className={styles.navDesktop} aria-label={navigationLabel}>
        {headerNavItems.map((item) => (
          <Link key={item.href} href={`/${locale}/${item.href}`}>
            {locale === "en" ? item.en : item.uk}
          </Link>
        ))}
        {managementHref ? <Link href={managementHref}>{isUkrainian ? "Панель керування" : "Management"}</Link> : null}
      </nav>
      <div className={styles.actions}>
        <a href={`tel:${phone.replaceAll(/[^+\d]/g, "")}`}>{phone}</a>
        <Link className={styles.order} href={`/${locale}/order`}>
          {isUkrainian ? "Розрахунок" : "Get a quote"}
        </Link>
      </div>
    </header>
  );
}
