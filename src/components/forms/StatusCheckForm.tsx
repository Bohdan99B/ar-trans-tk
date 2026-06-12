"use client";

import { FormEvent, useState } from "react";

import styles from "./Forms.module.css";

type Result = {
  requestNumber: string;
  status: string;
  route: string;
  createdAt: string;
};

export function StatusCheckForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError("");
    const params = new URLSearchParams(
      Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>,
    );
    const response = await fetch(`/api/status?${params}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Заявку не знайдено.");
      return;
    }
    setResult(data);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Номер заявки *</span>
        <input name="requestNumber" required />
      </label>
      <label className={styles.field}>
        <span>Електронна пошта або телефон *</span>
        <input name="contact" required />
      </label>
      <button className={styles.button} type="submit">
        Перевірити статус
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {result && (
        <p className={styles.message}>
          {result.requestNumber}: {result.status}. Маршрут: {result.route}
        </p>
      )}
    </form>
  );
}
