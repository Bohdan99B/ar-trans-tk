"use client";

import { useState } from "react";

import styles from "../../signin/Signin.module.css";

type ForgotPasswordFormProps = {
  locale: string;
  messages: {
    email: string;
    invalidEmail: string;
    neutralResponse: string;
    requestFailed: string;
    sendRequest: string;
    sendingRequest: string;
  };
};

export function ForgotPasswordForm({ locale, messages }: ForgotPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setMessage(null);

    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(messages.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/auth/forgot-password", {
      body: JSON.stringify({ email, locale }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error ?? messages.requestFailed);
      return;
    }

    setMessage(messages.neutralResponse);
    form.reset();
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <label>
        {messages.email}
        <input autoComplete="email" disabled={isSubmitting} inputMode="email" name="email" required type="email" />
      </label>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {message ? <p className={styles.success} role="status">{message}</p> : null}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? messages.sendingRequest : messages.sendRequest}
      </button>
    </form>
  );
}
