"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import styles from "../Site.module.css";

type AdminNavProps = {
  initialPasswordResetCount: number;
  isAdmin: boolean;
  links: {
    href: string;
    label: string;
  }[];
};

export function AdminNav({ initialPasswordResetCount, isAdmin, links }: AdminNavProps) {
  const pathname = usePathname();
  const [passwordResetCount, setPasswordResetCount] = useState(initialPasswordResetCount);

  const refreshCount = useCallback(async () => {
    if (!isAdmin) return;
    const response = await fetch("/api/admin/password-reset-requests?summary=1", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json().catch(() => null);
    if (typeof payload?.activeCount === "number") {
      setPasswordResetCount(payload.activeCount);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = window.setInterval(refreshCount, 10_000);
    const handleUpdate = () => void refreshCount();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refreshCount();
    };
    window.addEventListener("password-reset-updated", handleUpdate);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("password-reset-updated", handleUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAdmin, refreshCount]);

  return (
    <nav className={styles.adminNav} aria-label="Admin navigation">
      {links.map((link) => {
        const isDashboard = link.href.endsWith("/admin");
        const isActive = pathname === link.href || (!isDashboard && pathname.startsWith(`${link.href}/`));

        return (
          <Link aria-current={isActive ? "page" : undefined} href={link.href} key={link.href}>
            <span>{link.label}</span>
            {link.href.endsWith("/employees") && passwordResetCount > 0 ? (
              <strong className={styles.adminNavBadge} aria-label={`${passwordResetCount} активних запитів`}>
                {passwordResetCount}
              </strong>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
