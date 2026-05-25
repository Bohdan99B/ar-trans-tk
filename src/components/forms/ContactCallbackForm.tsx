"use client";

import { FormEvent, useState } from "react";

import styles from "./Forms.module.css";

export function ContactCallbackForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/contact", {
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setMessage(response.ok ? "Контакти отримано. Менеджер зв'яжеться з вами." : "Не вдалося надіслати форму.");
    if (response.ok) form.reset();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Телефон або email *</span>
        <input name="contact" required />
      </label>
      <label className={styles.field}>
        <span>Зручний час</span>
        <input name="time" placeholder="Завтра після 10:00" />
      </label>
      <button className={styles.button} type="submit">
        Зв&apos;язатися з менеджером
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
