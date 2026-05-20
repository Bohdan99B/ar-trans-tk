import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

import styles from "./Footer.module.css";

type FooterProps = {
  locale: string;
};

export function Footer({ locale }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.brandBlock}>
        <Logo />
        <p>Вантажні, міжнародні та рефрижераторні перевезення для бізнесу по Україні та Європі.</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <Link href={`/${locale}/services`}>Послуги</Link>
        <Link href={`/${locale}/fleet`}>Автопарк</Link>
        <Link href={`/${locale}/contacts`}>Контакти</Link>
        <Link href={`/${locale}/order`}>Отримати розрахунок</Link>
        <Link href={`/${locale}/status`}>Статус заявки</Link>
        <Link href={`/${locale}/privacy-policy`}>Політика конфіденційності</Link>
      </nav>
      <div className={styles.contactLine}>
        <a href="tel:+380671204588">+380 (67) 120-45-88</a>
        <a href="mailto:sales@ar-trans-tk.ua">sales@ar-trans-tk.ua</a>
      </div>
    </footer>
  );
}
