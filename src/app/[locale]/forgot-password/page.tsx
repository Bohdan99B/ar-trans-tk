import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/Logo";

import styles from "../../signin/Signin.module.css";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <section className={styles.screen}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/signin">
          {t("backToSignin")}
        </Link>
        <div className={styles.card}>
          <Logo />
          <div className={styles.intro}>
            <h1>{t("forgotTitle")}</h1>
            <p>{t("forgotDescription")}</p>
          </div>
          <ForgotPasswordForm
            locale={locale}
            messages={{
              email: t("email"),
              invalidEmail: t("invalidEmail"),
              neutralResponse: t("neutralResponse"),
              requestFailed: t("requestFailed"),
              sendRequest: t("sendRequest"),
              sendingRequest: t("sendingRequest"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
