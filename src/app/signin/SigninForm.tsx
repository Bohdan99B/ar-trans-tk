"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getPostLoginPath } from "@/lib/auth-redirects";

import styles from "./Signin.module.css";

type SigninFormProps = {
  callbackUrl?: string;
  messages: {
    email: string;
    invalidCredentials: string;
    password: string;
    requiredCredentials: string;
    signin: string;
    signingIn: string;
    staffOnly: string;
  };
  passwordResetSuccess?: string;
};

type SessionPayload = {
  user?: {
    role?: "OWNER" | "ADMIN" | "MANAGER";
  };
};

export function SigninForm({ callbackUrl, messages, passwordResetSuccess }: SigninFormProps) {
  const router = useRouter();
  const resetToastShown = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!passwordResetSuccess || resetToastShown.current) {
      return;
    }

    resetToastShown.current = true;
    toast.success(passwordResetSuccess);

    const url = new URL(window.location.href);
    url.searchParams.delete("passwordReset");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [passwordResetSuccess]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError(messages.requiredCredentials);
      return;
    }

    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setIsSubmitting(false);
      setError(messages.invalidCredentials);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
    const session = (await sessionResponse.json().catch(() => null)) as SessionPayload | null;
    const role = session?.user?.role;

    setIsSubmitting(false);
    if (!role) {
      setError(messages.staffOnly);
      return;
    }

    router.replace(getPostLoginPath(role, callbackUrl));
    router.refresh();
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <label>
        {messages.email}
        <input autoComplete="email" disabled={isSubmitting} inputMode="email" name="email" required type="email" />
      </label>
      <label>
        {messages.password}
        <input autoComplete="current-password" disabled={isSubmitting} name="password" required type="password" />
      </label>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? messages.signingIn : messages.signin}
      </button>
    </form>
  );
}
