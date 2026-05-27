"use client";

import { FormEvent, useState } from "react";

import { FieldErrors, validateFormData } from "@/lib/form-validation";
import { contactSchema } from "@/lib/validators";

import styles from "./Forms.module.css";

export function ContactCallbackForm() {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateFormData(contactSchema, formData);

    if (validation.errors) {
      setErrors(validation.errors);
      setMessage("");
      return;
    }

    setErrors({});
    const response = await fetch("/api/contact", {
      body: JSON.stringify(validation.data),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setMessage(response.ok ? "Контакти отримано. Менеджер зв'яжеться з вами." : "Не вдалося надіслати форму.");
    if (response.ok) form.reset();
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Телефон або email *</span>
        <input aria-describedby="callback-contact-error" aria-invalid={Boolean(errors.contact)} name="contact" required />
        <span className={styles.fieldHint} data-visible={Boolean(errors.contact)} id="callback-contact-error">
          {errors.contact}
        </span>
      </label>
      <label className={styles.field}>
        <span>Зручний час</span>
        <input aria-describedby="callback-time-error" aria-invalid={Boolean(errors.time)} name="time" placeholder="Завтра після 10:00" />
        <span className={styles.fieldHint} data-visible={Boolean(errors.time)} id="callback-time-error">
          {errors.time}
        </span>
      </label>
      <button className={styles.button} type="submit">
        Зв&apos;язатися з менеджером
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
