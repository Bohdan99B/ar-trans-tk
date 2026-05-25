"use client";

import { FormEvent, useState } from "react";

import styles from "./Forms.module.css";

export function VacancyApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage("");
    const response = await fetch("/api/vacancy-applications", { body: new FormData(form), method: "POST" });
    setPending(false);
    setMessage(response.ok ? "Заявку на вакансію надіслано." : "Не вдалося надіслати заявку.");
    if (response.ok) form.reset();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <input name="vacancyId" type="hidden" value={vacancyId} />
      <label className={styles.field}><span>Ім&apos;я *</span><input name="name" required /></label>
      <label className={styles.field}><span>Телефон *</span><input name="phone" required /></label>
      <label className={styles.field}><span>Email</span><input name="email" type="email" /></label>
      <label className={styles.field}><span>Коментар</span><textarea name="comment" /></label>
      <label className={styles.field}><span>CV файл</span><input accept=".pdf,.doc,.docx" name="cv" type="file" /></label>
      <button className={styles.button} disabled={pending} type="submit">{pending ? "Надсилання..." : "Відгукнутися"}</button>
      {message ? <p className={styles.message}>{message}</p> : null}
    </form>
  );
}
