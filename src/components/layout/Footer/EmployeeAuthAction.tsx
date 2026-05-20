"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import styles from "./Footer.module.css";

type EmployeeAuthActionProps = {
  isAuthenticated: boolean;
  locale: string;
};

export function EmployeeAuthAction({ isAuthenticated, locale }: EmployeeAuthActionProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link className={styles.employeeLogin} href="/signin">
        Вхід співробітника
      </Link>
    );
  }

  return (
    <button
      className={styles.employeeLogin}
      disabled={isSigningOut}
      onClick={() => {
        setIsSigningOut(true);
        void signOut({ callbackUrl: `/${locale}` });
      }}
      type="button"
    >
      {isSigningOut ? "Вихід..." : "Вийти з робочого простору"}
    </button>
  );
}
