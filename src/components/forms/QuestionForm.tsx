"use client";

import { FormEvent, useState } from "react";

import { FieldErrors, validateFormData } from "@/lib/validations";
import { questionSchema } from "@/lib/validations";

import styles from "./Forms.module.css";

type QuestionFormProps = {
  className?: string;
};

export function QuestionForm({ className }: QuestionFormProps) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateFormData(questionSchema, formData);

    if (validation.errors) {
      setErrors(validation.errors);
      setMessage("");
      return;
    }

    setErrors({});
    const response = await fetch("/api/questions", {
      body: JSON.stringify(validation.data),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setMessage(response.ok ? "Питання надіслано менеджеру." : "Не вдалося надіслати питання.");
    if (response.ok) form.reset();
  }

  return (
    <form className={`${styles.form}${className ? ` ${className}` : ""}`} noValidate onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Ваш контакт *</span>
        <input aria-describedby="question-contact-error" aria-invalid={Boolean(errors.contact)} name="contact" required />
        <span className={styles.fieldHint} data-visible={Boolean(errors.contact)} id="question-contact-error">
          {errors.contact}
        </span>
      </label>
      <label className={styles.field}>
        <span>Питання *</span>
        <textarea aria-describedby="question-text-error" aria-invalid={Boolean(errors.question)} name="question" required />
        <span className={styles.fieldHint} data-visible={Boolean(errors.question)} id="question-text-error">
          {errors.question}
        </span>
      </label>
      <button className={styles.button} type="submit">
        Надіслати питання
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}
