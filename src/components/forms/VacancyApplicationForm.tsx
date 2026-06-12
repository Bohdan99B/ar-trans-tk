"use client";

import { FormEvent, useState } from "react";

import { FieldErrors, validateFormData } from "@/lib/form-validation";
import { vacancyApplicationSchema } from "@/lib/validators";

import styles from "./Forms.module.css";

export function VacancyApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateFormData(vacancyApplicationSchema, formData);

    if (validation.errors) {
      setErrors(validation.errors);
      setMessage("");
      return;
    }

    setPending(true);
    setErrors({});
    setMessage("");
    const response = await fetch("/api/vacancy-applications", { body: formData, method: "POST" });
    setPending(false);
    setMessage(response.ok ? "Заявку на вакансію надіслано." : "Не вдалося надіслати заявку.");
    if (response.ok) form.reset();
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <input name="vacancyId" type="hidden" value={vacancyId} />
      <label className={styles.field}>
        <span>Ім&apos;я *</span>
        <input aria-describedby="vacancy-name-error" aria-invalid={Boolean(errors.name)} name="name" required />
        <span className={styles.fieldHint} data-visible={Boolean(errors.name)} id="vacancy-name-error">{errors.name}</span>
      </label>
      <label className={styles.field}>
        <span>Телефон *</span>
        <input aria-describedby="vacancy-phone-error" aria-invalid={Boolean(errors.phone)} name="phone" required />
        <span className={styles.fieldHint} data-visible={Boolean(errors.phone)} id="vacancy-phone-error">{errors.phone}</span>
      </label>
      <label className={styles.field}>
        <span>Електронна пошта</span>
        <input aria-describedby="vacancy-email-error" aria-invalid={Boolean(errors.email)} name="email" type="email" />
        <span className={styles.fieldHint} data-visible={Boolean(errors.email)} id="vacancy-email-error">{errors.email}</span>
      </label>
      <label className={styles.field}>
        <span>Коментар</span>
        <textarea aria-describedby="vacancy-comment-error" aria-invalid={Boolean(errors.comment)} name="comment" />
        <span className={styles.fieldHint} data-visible={Boolean(errors.comment)} id="vacancy-comment-error">{errors.comment}</span>
      </label>
      <label className={styles.field}><span>CV файл</span><input accept=".pdf,.doc,.docx" name="cv" type="file" /></label>
      <button className={styles.button} disabled={pending} type="submit">{pending ? "Надсилання..." : "Відгукнутися"}</button>
      {message ? <p className={styles.message}>{message}</p> : null}
    </form>
  );
}
