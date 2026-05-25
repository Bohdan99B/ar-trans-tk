"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../Site.module.css";

type AdminNavProps = {
  links: {
    href: string;
    label: string;
  }[];
};

export function AdminNav({ links }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.adminNav} aria-label="Admin navigation">
      {links.map((link) => {
        const isDashboard = link.href.endsWith("/admin");
        const isActive = pathname === link.href || (!isDashboard && pathname.startsWith(`${link.href}/`));

        return (
          <Link aria-current={isActive ? "page" : undefined} href={link.href} key={link.href}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
