"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "../../signin/Signin.module.css";

type ResetPasswordFormProps = {
  messages: {
    confirmPassword: string;
    newPassword: string;
    passwordMin: string;
    passwordMismatch: string;
    resetFailed: string;
    resetSuccess: string;
    savePassword: string;
    savingPassword: string;
    signin: string;
  };
  token: string;
};

export function ResetPasswordForm({ messages, token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    setIsSubmitting(true);
    const response = await fetch("/api/auth/reset-password", {
      body: JSON.stringify({ password, token }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error ?? messages.resetFailed);
      return;
    }

    setIsComplete(true);
  }

  if (isComplete) {
    return (
      <>
        <p className={styles.success} role="status">{messages.resetSuccess}</p>
        <Link className={styles.authLink} href="/signin">
          {messages.signin}
        </Link>
      </>
    );
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
