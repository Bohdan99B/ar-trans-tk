import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/Logo";
import { routing } from "@/i18n/routing";
import { authOptions } from "@/lib/auth";
import { getPostLoginPath } from "@/lib/auth/redirects";

import styles from "./Signin.module.css";
import { SigninForm } from "./SigninForm";

type SigninPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    locale?: string;
    passwordReset?: string;
  }>;
};

export default async function SigninPage({ searchParams }: SigninPageProps) {
  const { callbackUrl, error, locale: requestedLocale, passwordReset } = await searchParams;
  const locale = routing.locales.find((supportedLocale) => supportedLocale === requestedLocale) ?? routing.defaultLocale;
  const [session, t] = await Promise.all([
    getServerSession(authOptions),
    getTranslations({ locale, namespace: "auth" }),
  ]);

  if (session?.user?.role) {
    redirect(getPostLoginPath(session.user.role, callbackUrl));
  }

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <Link className={styles.backLink} href={`/${locale}`}>
          {t("backToSite")}
        </Link>
        <div className={styles.card}>
          <Logo />
          <div className={styles.intro}>
            <h1>{t("employeeSignin")}</h1>
            <p>{t("signinDescription")}</p>
          </div>
          <SigninForm
            callbackUrl={callbackUrl}
            messages={{
              email: t("email"),
              invalidCredentials: t("invalidCredentials"),
              requiredCredentials: t("requiredCredentials"),
              signin: t("signin"),
              signingIn: t("signingIn"),
              staffOnly: t("staffOnly"),
              password: t("password"),
            }}
            passwordResetSuccess={passwordReset === "success" ? t("resetSuccess") : undefined}
          />
          <Link className={styles.authLink} href={`/${locale}/forgot-password`}>
            {t("forgotPassword")}
          </Link>
          {error ? <p className={styles.error}>{t("invalidCredentials")}</p> : null}
          <p className={styles.notice}>{t("staffOnly")}</p>
        </div>
      </section>
    </main>
  );
}
