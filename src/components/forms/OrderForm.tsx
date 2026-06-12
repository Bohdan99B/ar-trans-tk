"use client";

import { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent, useMemo, useState } from "react";

import { FieldErrors, validateFormData } from "@/lib/form-validation";
import { orderRequestSchema } from "@/lib/validators";

import styles from "./Forms.module.css";

type State = {
  error?: string;
  fieldErrors?: FieldErrors;
  message?: string;
  requestNumber?: string;
};

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const dateErrorMessage = "Введіть коректну дату";

function startOfToday() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join(".");
}

function getDateValidationError(value: string) {
  if (!value) {
    return "";
  }

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    return value.length === 10 ? dateErrorMessage : "";
  }

  const [dayValue, monthValue, yearValue] = value.split(".");
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(year, month - 1, day);

  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date < startOfToday()
  ) {
    return dateErrorMessage;
  }

  return "";
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match || getDateValidationError(value)) {
    return "";
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "";
  }

  return formatIsoDate(date);
}

function isAllowedDateKey(event: KeyboardEvent<HTMLInputElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  return (
    event.key.length > 1 ||
    /\d/.test(event.key) ||
    event.key === "."
  );
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

function FieldError({ children, id }: { children?: string; id: string }) {
  return (
    <span className={styles.fieldHint} data-visible={Boolean(children)} id={id}>
      {children}
    </span>
  );
}

export function OrderForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [shouldShowDateError, setShouldShowDateError] = useState(false);
  const preferredDateError =
    getDateValidationError(preferredDate) ||
    (shouldShowDateError && preferredDate && !parseDisplayDate(preferredDate) ? dateErrorMessage : "");
  const preferredDateValue = parseDisplayDate(preferredDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (preferredDateError || (preferredDate && !preferredDateValue)) {
      setShouldShowDateError(true);
      setState({ error: dateErrorMessage });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateFormData(orderRequestSchema, formData);

    if (validation.errors) {
      setState({ error: "Перевірте поля форми.", fieldErrors: validation.errors });
      return;
    }

    setIsSubmitting(true);
    setState({});
    const response = await fetch("/api/requests", {
      body: JSON.stringify(validation.data),
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
    setPreferredDate("");
    setShouldShowDateError(false);
    setIsCalendarOpen(false);
    setState({
      fieldErrors: {},
      message: "Заявку створено. Номер для перевірки статусу:",
      requestNumber: data.requestNumber,
    });
  }

  function onPreferredDateChange(event: ChangeEvent<HTMLInputElement>) {
    const value = maskDateInput(event.target.value);
    setPreferredDate(value);
    setShouldShowDateError(false);
    const isoDate = parseDisplayDate(value);

    if (isoDate) {
      const [year, month] = isoDate.split("-").map(Number);
      setCalendarMonth(new Date(year, month - 1, 1));
    }
  }

  function onPreferredDatePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    setPreferredDate(maskDateInput(event.clipboardData.getData("text")));
    setShouldShowDateError(false);
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Ім&apos;я *</span>
          <input aria-describedby="order-name-error" aria-invalid={Boolean(state.fieldErrors?.name)} name="name" required />
          <FieldError id="order-name-error">{state.fieldErrors?.name}</FieldError>
        </label>
        <label className={styles.field}>
          <span>Телефон *</span>
          <input aria-describedby="order-phone-error" aria-invalid={Boolean(state.fieldErrors?.phone)} name="phone" required type="tel" />
          <FieldError id="order-phone-error">{state.fieldErrors?.phone}</FieldError>
        </label>
        {!compact && (
          <>
            <label className={styles.field}>
              <span>Електронна пошта</span>
              <input aria-describedby="order-email-error" aria-invalid={Boolean(state.fieldErrors?.email)} name="email" type="email" />
              <FieldError id="order-email-error">{state.fieldErrors?.email}</FieldError>
            </label>
            <label className={styles.field}>
              <span>Компанія</span>
              <input aria-describedby="order-company-error" aria-invalid={Boolean(state.fieldErrors?.company)} name="company" />
              <FieldError id="order-company-error">{state.fieldErrors?.company}</FieldError>
            </label>
          </>
        )}
        <label className={styles.field}>
          <span>Звідки *</span>
          <input aria-describedby="order-origin-error" aria-invalid={Boolean(state.fieldErrors?.origin)} name="origin" placeholder="Країна, населений пункт, квадрат" required />
          <FieldError id="order-origin-error">{state.fieldErrors?.origin}</FieldError>
        </label>
        <label className={styles.field}>
          <span>Куди *</span>
          <input aria-describedby="order-destination-error" aria-invalid={Boolean(state.fieldErrors?.destination)} name="destination" placeholder="Країна, населений пункт, квадрат" required />
          <FieldError id="order-destination-error">{state.fieldErrors?.destination}</FieldError>
        </label>
        <label className={styles.field}>
          <span>Тип вантажу *</span>
          <input aria-describedby="order-cargo-error" aria-invalid={Boolean(state.fieldErrors?.cargoType)} name="cargoType" required />
          <FieldError id="order-cargo-error">{state.fieldErrors?.cargoType}</FieldError>
        </label>
        <label className={styles.field}>
          <span>Температурний режим *</span>
          <input aria-describedby="order-temperature-error" aria-invalid={Boolean(state.fieldErrors?.temperatureMode)} name="temperatureMode" placeholder="-20 . . . +20" required />
          <FieldError id="order-temperature-error">{state.fieldErrors?.temperatureMode}</FieldError>
        </label>
        <label className={styles.field}>
          <span>Вага *</span>
          <input aria-describedby="order-weight-error" aria-invalid={Boolean(state.fieldErrors?.weight)} name="weight" placeholder="до 22 т" required />
          <FieldError id="order-weight-error">{state.fieldErrors?.weight}</FieldError>
        </label>
        <label className={`${styles.field} ${styles.dateField}`}>
          <span>Бажана дата</span>
          <input
            aria-describedby="preferred-date-error"
            aria-invalid={Boolean(preferredDateError)}
            inputMode="numeric"
            maxLength={10}
            onChange={onPreferredDateChange}
            onClick={() => setIsCalendarOpen(true)}
            onBlur={() => setShouldShowDateError(true)}
            onKeyDown={(event) => {
              if (!isAllowedDateKey(event)) {
                event.preventDefault();
              }
            }}
            onPaste={onPreferredDatePaste}
            pattern="\d{2}\.\d{2}\.\d{4}"
            placeholder="дд.мм.рррр"
            title="Вкажіть дату у форматі день.місяць.рік"
            value={preferredDate}
          />
          <input name="preferredDate" type="hidden" value={preferredDateValue} />
          <span className={styles.fieldHint} data-visible={Boolean(preferredDateError)} id="preferred-date-error">
            {preferredDateError || dateErrorMessage}
          </span>
          {isCalendarOpen && (
            <div className={styles.datePicker}>
              <div className={styles.datePickerHeader}>
                <button
                  aria-label="Попередній місяць"
                  onClick={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                  type="button"
                >
                  ‹
                </button>
                <strong>
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </strong>
                <button
                  aria-label="Наступний місяць"
                  onClick={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                  type="button"
                >
                  ›
                </button>
              </div>
              <div className={styles.datePickerGrid}>
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
                {calendarDays.map((date, index) =>
                  date ? (
                    <button
                      aria-disabled={date < startOfToday()}
                      className={preferredDateValue === formatIsoDate(date) ? styles.selectedDate : undefined}
                      disabled={date < startOfToday()}
                      key={formatIsoDate(date)}
                      onClick={() => {
                        setPreferredDate(formatDisplayDate(date));
                        setShouldShowDateError(false);
                        setIsCalendarOpen(false);
                      }}
                      type="button"
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <i aria-hidden="true" key={`empty-${index}`} />
                  ),
                )}
              </div>
            </div>
          )}
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>Коментар</span>
          <textarea aria-describedby="order-comment-error" aria-invalid={Boolean(state.fieldErrors?.comment)} name="comment" placeholder="Вкажіть додаткову інформацію" />
          <FieldError id="order-comment-error">{state.fieldErrors?.comment}</FieldError>
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
