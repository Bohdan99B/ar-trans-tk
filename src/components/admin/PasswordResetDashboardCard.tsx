"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import styles from "@/app/[locale]/Site.module.css";
import adminStyles from "@/components/admin/Admin.module.css";

type PasswordResetDashboardCardProps = {
  action: string;
  description: string;
  href: string;
  initialCount: number;
  title: string;
};

export function PasswordResetDashboardCard({
  action,
  description,
  href,
  initialCount,
  title,
}: PasswordResetDashboardCardProps) {
  const [count, setCount] = useState(initialCount);

  const refreshCount = useCallback(async () => {
    const response = await fetch("/api/admin/password-reset-requests?summary=1", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json().catch(() => null);
    if (typeof payload?.activeCount === "number") setCount(payload.activeCount);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshCount, 10_000);
    const handleUpdate = (event: Event) => {
      const activeCount = (event as CustomEvent<{ activeCount?: number }>).detail?.activeCount;
      if (typeof activeCount === "number") setCount(activeCount);
      else void refreshCount();
    };
    window.addEventListener("password-reset-updated", handleUpdate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("password-reset-updated", handleUpdate);
    };
  }, [refreshCount]);

  if (count === 0) return null;

  return (
    <article className={styles.card}>
      <h2 className={adminStyles.metricHeading}>
        <span>{title}</span>
        <strong>{count}</strong>
      </h2>
      <p>{description}</p>
      <Link className={adminStyles.linkButton} href={href}>{action}</Link>
    </article>
  );
}
