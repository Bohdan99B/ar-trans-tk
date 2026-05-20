import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/Logo";
import { authOptions } from "@/lib/auth";
import { getPostLoginPath } from "@/lib/auth-redirects";

import styles from "./Signin.module.css";
import { SigninForm } from "./SigninForm";

type SigninPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SigninPage({ searchParams }: SigninPageProps) {
  const [{ callbackUrl, error }, session] = await Promise.all([searchParams, getServerSession(authOptions)]);

  if (session?.user?.role) {
    redirect(getPostLoginPath(session.user.role, callbackUrl));
  }

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <Link className={styles.backLink} href="/uk">
          Повернутись на сайт
        </Link>
        <div className={styles.card}>
          <Logo />
          <div className={styles.intro}>
            <h1>Вхід співробітника</h1>
            <p>Увійдіть, щоб отримати доступ до панелі керування</p>
          </div>
          <SigninForm callbackUrl={callbackUrl} />
          {error ? <p className={styles.error}>Неправильний email або пароль.</p> : null}
          <p className={styles.notice}>Доступ лише для співробітників компанії.</p>
        </div>
      </section>
    </main>
  );
}
