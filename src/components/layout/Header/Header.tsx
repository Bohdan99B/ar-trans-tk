import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { getCurrentUser } from "@/lib/auth";
import { navItems } from "@/lib/content";

import styles from "./Header.module.css";

type HeaderProps = {
  locale: string;
};

export async function Header({ locale }: HeaderProps) {
  const user = await getCurrentUser();
  const managementHref =
    user?.role === "ADMIN"
      ? `/${locale}/admin`
      : user?.role === "MANAGER"
        ? `/${locale}/manager`
        : null;

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={`/${locale}`}>
        <Logo />
      </Link>
      <details className={styles.menu}>
        <summary aria-label="Відкрити меню">
          <span />
          <span />
          <span />
        </summary>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={`/${locale}/${item.href}`}>
              {locale === "en" ? item.en : item.uk}
            </Link>
          ))}
          {managementHref ? <Link href={managementHref}>Місце керування</Link> : null}
        </nav>
      </details>
      <nav className={styles.navDesktop} aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={`/${locale}/${item.href}`}>
            {locale === "en" ? item.en : item.uk}
          </Link>
        ))}
        {managementHref ? <Link href={managementHref}>Місце керування</Link> : null}
      </nav>
      <div className={styles.actions}>
        <a href="tel:+380671204588">+380 (67) 120-45-88</a>
        <Link className={styles.order} href={`/${locale}/order`}>
          Розрахунок
        </Link>
      </div>
    </header>
  );
}
