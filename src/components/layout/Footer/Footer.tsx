import { getServerSession } from "next-auth";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { authOptions } from "@/lib/auth";

import { EmployeeAuthAction } from "./EmployeeAuthAction";
import styles from "./Footer.module.css";

type FooterProps = {
  locale: string;
};

export async function Footer({ locale }: FooterProps) {
  const session = await getServerSession(authOptions);

  return (
    <footer className={styles.footer}>
      <div className={styles.brandBlock}>
        <Logo />
        <p>Вантажні, міжнародні та рефрижераторні перевезення для бізнесу по Україні та Європі.</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <Link href={`/${locale}/about-company`}>Про компанію</Link>
        <Link href={`/${locale}/services`}>Послуги</Link>
        <Link href={`/${locale}/fleet`}>Автопарк</Link>
        <Link href={`/${locale}/geography`}>Географія</Link>
        <Link href={`/${locale}/reviews`}>Відгуки</Link>
        <Link href={`/${locale}/faq`}>FAQ</Link>
        <Link href={`/${locale}/contacts`}>Контакти</Link>
        <Link href={`/${locale}/order`}>Отримати розрахунок</Link>
        <Link href={`/${locale}/status`}>Статус заявки</Link>
        <Link href={`/${locale}/privacy-policy`}>Політика конфіденційності</Link>
        <EmployeeAuthAction isAuthenticated={Boolean(session?.user)} locale={locale} />
      </nav>
      <div className={styles.contactLine}>
        <a href="tel:+380671204588">+380 (67) 120-45-88</a>
        <a href="mailto:sales@ar-trans-tk.ua">sales@ar-trans-tk.ua</a>
      </div>
    </footer>
  );
}
