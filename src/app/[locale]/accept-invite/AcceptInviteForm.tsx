"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getPostLoginPath } from "@/lib/auth-redirects";

import styles from "./AcceptInvite.module.css";

type AcceptInviteFormProps = {
  locale: string;
  token: string;
};

export function AcceptInviteForm({ locale, token }: AcceptInviteFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function acceptInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const response = await fetch("/api/employee-invitations/accept", {
      body: JSON.stringify({ password, token }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);

    setIsSubmitting(false);
    if (!response.ok) {
      setMessage(payload?.error ?? "Не вдалося прийняти запрошення");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: payload.email,
      password,
      redirect: false,
    });

    if (!signInResult?.ok) {
      setMessage("Пароль збережено. Увійдіть через сторінку входу співробітника.");
      return;
    }

    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await sessionResponse.json().catch(() => null);
    router.replace(getPostLoginPath(session?.user?.role, `/${locale}/admin`));
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={acceptInvite}>
      <label>
        Новий пароль
        <input autoComplete="new-password" minLength={10} name="password" required type="password" />
      </label>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Збереження..." : "Задати пароль"}
      </button>
      {message ? <p className={styles.error}>{message}</p> : null}
    </form>
  );
}
