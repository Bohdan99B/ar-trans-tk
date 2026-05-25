import { getServerSession } from "next-auth";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { EmployeeAuthAction } from "./EmployeeAuthAction";
import styles from "./Footer.module.css";

type FooterProps = {
  locale: string;
};

export async function Footer({ locale }: FooterProps) {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    prisma.siteSetting.findMany({ where: { key: { in: ["brand.logo", "contact.phones", "contact.email", "contact.address", "contact.hours", "contact.socials"] } } }),
  ]);
  const values = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  const phone = values["contact.phones"]?.split(/\r?\n|,/)[0]?.trim() || "+380 (67) 120-45-88";
  const email = values["contact.email"] || "sales@ar-trans-tk.ua";

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.brandBlock}>
          <Logo imageUrl={values["brand.logo"]} />
          <p>Вантажні, міжнародні та рефрижераторні перевезення для бізнесу по Україні та Європі.</p>
        </div>
        <nav className={styles.linkGroup} aria-label="Навігація у футері">
          <div className={`${styles.links} ${styles.navLinks}`}>
            <Link href={`/${locale}/about-company`}>Про компанію</Link>
            <Link href={`/${locale}/services`}>Послуги</Link>
            <Link href={`/${locale}/fleet`}>Автопарк</Link>
            <Link href={`/${locale}/geography`}>Географія</Link>
            <Link href={`/${locale}/reviews`}>Відгуки</Link>
            <Link href={`/${locale}/faq`}>FAQ</Link>
            <Link href={`/${locale}/contacts`}>Контакти</Link>
            <Link href={`/${locale}/cooperation`}>{locale === "en" ? "Cooperation" : "Співпраця"}</Link>
          </div>
        </nav>
        <nav className={styles.linkGroup} aria-label="Сервіси у футері">
          <div className={styles.links}>
            <Link href={`/${locale}/order`}>Отримати розрахунок</Link>
            <Link href={`/${locale}/status`}>Статус заявки</Link>
          </div>
        </nav>
        <div className={styles.contactGroup}>
          <div className={styles.contactLine}>
            <a href={`tel:${phone.replaceAll(/[^+\d]/g, "")}`}>{phone}</a>
            <a href={`mailto:${email}`}>{email}</a>
            {values["contact.address"] ? <span>{values["contact.address"]}</span> : null}
            {values["contact.hours"] ? <span>{values["contact.hours"]}</span> : null}
            {values["contact.socials"] ? <span>{values["contact.socials"]}</span> : null}
            <Link href={`/${locale}/privacy-policy`}>Політика конфіденційності</Link>
            <EmployeeAuthAction isAuthenticated={Boolean(session?.user)} locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
