"use client";

import { FormEvent, useState } from "react";

import styles from "./Forms.module.css";

type State = {
  error?: string;
  message?: string;
  requestNumber?: string;
};

export function OrderForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({});
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/requests", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setState({ error: data.error ?? "Перевірте обов'язкові поля." });
      return;
    }

    form.reset();
    setState({
      message: "Заявку створено. Номер для перевірки статусу:",
      requestNumber: data.requestNumber,
    });
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Ім&apos;я *</span>
          <input name="name" required />
        </label>
        <label className={styles.field}>
          <span>Телефон *</span>
          <input name="phone" required type="tel" />
        </label>
        {!compact && (
          <>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" />
            </label>
            <label className={styles.field}>
              <span>Компанія</span>
              <input name="company" />
            </label>
          </>
        )}
        <label className={styles.field}>
          <span>Звідки *</span>
          <input name="origin" required />
        </label>
        <label className={styles.field}>
          <span>Куди *</span>
          <input name="destination" required />
        </label>
        <label className={styles.field}>
          <span>Тип вантажу *</span>
          <input name="cargoType" required />
        </label>
        <label className={styles.field}>
          <span>Температурний режим *</span>
          <input name="temperatureMode" placeholder="-18 C, +2...+6 C" required />
        </label>
        <label className={styles.field}>
          <span>Вага *</span>
          <input name="weight" placeholder="до 22 т" required />
        </label>
        <label className={styles.field}>
          <span>Бажана дата</span>
          <input name="preferredDate" type="date" />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>Коментар</span>
          <textarea name="comment" />
        </label>
      </div>
      <button className={styles.button} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Надсилаємо..." : "Отримати розрахунок"}
      </button>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.message && (
        <p className={styles.message}>
          {state.message} <strong>{state.requestNumber}</strong>
        </p>
      )}
    </form>
  );
}
