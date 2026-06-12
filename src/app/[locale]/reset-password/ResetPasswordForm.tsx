"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "../../signin/Signin.module.css";

type ResetPasswordFormProps = {
  locale: string;
  messages: {
    confirmPassword: string;
    newPassword: string;
    passwordMin: string;
    passwordMismatch: string;
    resetFailed: string;
    savePassword: string;
    savingPassword: string;
  };
  token: string;
};

export function ResetPasswordForm({ locale, messages, token }: ResetPasswordFormProps) {
  const router = useRouter();
  const submitInProgress = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInProgress.current) {
      return;
    }

    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (password.length < 10) {
      setError(messages.passwordMin);
      return;
    }
    if (password !== confirmation) {
      setError(messages.passwordMismatch);
      return;
    }

    submitInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        body: JSON.stringify({ password, token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? messages.resetFailed);
        return;
      }

      const signinParams = new URLSearchParams({
        locale,
        passwordReset: "success",
      });
      router.replace(`/signin?${signinParams}`);
    } catch {
      setError(messages.resetFailed);
    } finally {
      submitInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <label>
        {messages.newPassword}
        <input autoComplete="new-password" disabled={isSubmitting} minLength={10} name="password" required type="password" />
      </label>
      <label>
        {messages.confirmPassword}
        <input autoComplete="new-password" disabled={isSubmitting} minLength={10} name="confirmation" required type="password" />
      </label>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? messages.savingPassword : messages.savePassword}
      </button>
    </form>
  );
}
