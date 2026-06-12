import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/Logo";

import styles from "../../signin/Signin.module.css";
import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <section className={styles.screen}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href={`/signin?locale=${locale}`}>
          {t("backToSignin")}
        </Link>
        <div className={styles.card}>
          <Logo />
          <div className={styles.intro}>
            <h1>{t("resetTitle")}</h1>
            <p>{t("resetDescription")}</p>
          </div>
          {token ? (
            <ResetPasswordForm
              locale={locale}
              messages={{
                confirmPassword: t("confirmPassword"),
                newPassword: t("newPassword"),
                passwordMin: t("passwordMin"),
                passwordMismatch: t("passwordMismatch"),
                resetFailed: t("resetFailed"),
                savePassword: t("savePassword"),
                savingPassword: t("savingPassword"),
              }}
              token={token}
            />
          ) : (
            <p className={styles.error}>{t("invalidResetLink")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
