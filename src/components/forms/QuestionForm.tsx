"use client";

import { FormEvent, useState } from "react";

import styles from "./Forms.module.css";

type QuestionFormProps = {
  className?: string;
};

export function QuestionForm({ className }: QuestionFormProps) {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/questions", {
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setMessage(response.ok ? "Питання надіслано менеджеру." : "Не вдалося надіслати питання.");
    if (response.ok) form.reset();
  }

  return (
    <form className={`${styles.form}${className ? ` ${className}` : ""}`} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Ваш контакт *</span>
        <input name="contact" required />
      </label>
      <label className={styles.field}>
        <span>Питання *</span>
        <textarea name="question" required />
      </label>
      <button className={styles.button} type="submit">
        Надіслати питання
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
