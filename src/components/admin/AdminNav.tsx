"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import styles from "@/app/[locale]/Site.module.css";

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
  const [open, setOpen] = useState(false);
  const [passwordResetCount, setPasswordResetCount] = useState(initialPasswordResetCount);
  const activeLink = links.find((link) => {
    const isDashboard = link.href.endsWith("/admin");
    return pathname === link.href || (!isDashboard && pathname.startsWith(`${link.href}/`));
  });

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
    <div className={styles.adminNavShell}>
      <button
        aria-controls="admin-navigation"
        aria-expanded={open}
        className={styles.adminNavToggle}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>
          <small>Розділ панелі</small>
          <strong>{activeLink?.label ?? "Навігація"}</strong>
        </span>
        <b aria-hidden="true">{open ? "−" : "+"}</b>
      </button>
      <nav
        aria-label="Навігація панелі керування"
        className={styles.adminNav}
        data-open={open}
        id="admin-navigation"
      >
        {links.map((link) => {
          const isDashboard = link.href.endsWith("/admin");
          const isActive = pathname === link.href || (!isDashboard && pathname.startsWith(`${link.href}/`));

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
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
    </div>
  );
}
