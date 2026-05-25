"use client";

import { FormEvent, useState } from "react";

import siteStyles from "@/app/[locale]/Site.module.css";
import buttonStyles from "@/components/ui/Buttons.module.css";

import styles from "./Forms.module.css";

type Vacancy = {
  description: string;
  id: string;
  location: string;
  requirements: string | null;
  title: string;
};

type Props = {
  locale: "en" | "uk";
  vacancies: Vacancy[];
};

export function CooperationDirections({ locale, vacancies }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [showDirectionQuestion, setShowDirectionQuestion] = useState(false);
  const [useCustomDirection, setUseCustomDirection] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);
  const copy = locale === "en" ? {
    city: "City",
    comment: "Comment",
    customDirection: "Your cooperation direction",
    directionsIntro: "Current opportunities for professionals who want to contribute to reliable logistics.",
    directionsTitle: "Cooperation directions",
    discuss: "Discuss cooperation",
    email: "Email",
    fallbackText: "Even if there are no open cooperation directions right now, you can leave your contacts and we will get in touch when a suitable opportunity appears.",
    fallbackTitle: "We are open to new connections",
    formIntro: "Tell us how to reach you. We will review your direction and contact you.",
    formTitle: "Discuss cooperation",
    other: "Other",
    positionQuestion: "Which position are you applying for?",
    selectedDirection: "Selected cooperation direction",
    location: "Location",
    name: "Name",
    phone: "Phone",
    requirements: "Requirements",
    sending: "Sending...",
    sent: "Your cooperation request has been submitted.",
    unavailable: "Could not submit your request. Please check the fields and try again.",
  } : {
    city: "Місто",
    comment: "Коментар",
    customDirection: "Ваш напрям співпраці",
    directionsIntro: "Актуальні можливості для фахівців, які хочуть долучитися до надійної логістики.",
    directionsTitle: "Напрями співпраці",
    discuss: "Обговорити співпрацю",
    email: "Email",
    fallbackText: "Навіть якщо зараз немає відкритих напрямів співпраці, ви можете залишити контакти — ми зв’яжемось з вами, коли з’явиться відповідна можливість.",
    fallbackTitle: "Ми відкриті до нових знайомств",
    formIntro: "Залиште контакти, і ми зв'яжемося з вами щодо обраного напряму.",
    formTitle: "Обговорити співпрацю",
    other: "Інше",
    positionQuestion: "На яку посаду ви претендуєте?",
    selectedDirection: "Обраний напрям співпраці",
    location: "Локація",
    name: "Ім'я",
    phone: "Телефон",
    requirements: "Вимоги",
    sending: "Надсилання...",
    sent: "Заявку на співпрацю надіслано.",
    unavailable: "Не вдалося надіслати заявку. Перевірте поля та спробуйте ще раз.",
  };

  function chooseDirection(id = "") {
    setSelectedId(id);
    setShowDirectionQuestion(false);
    setUseCustomDirection(false);
    document.getElementById("cooperation-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!selectedId && !useCustomDirection) {
      setShowDirectionQuestion(true);
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    setPending(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/cooperation-applications", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        setMessage(copy.sent);
        form.reset();
        setSelectedId("");
        setShowDirectionQuestion(false);
        setUseCustomDirection(false);
        return;
      }
    } catch {
      // Display the same recoverable state for a lost network connection.
    } finally {
      setPending(false);
    }
    setIsError(true);
    setMessage(copy.unavailable);
  }

  return (
    <>
      <section className={siteStyles.section} id="directions">
        <div className={siteStyles.container}>
          <p className={siteStyles.eyebrow}>{copy.directionsTitle}</p>
          <h2 className={siteStyles.heading}>{copy.directionsTitle}</h2>
          <p className={siteStyles.sectionIntro}>{copy.directionsIntro}</p>
          {vacancies.length ? (
            <div className={siteStyles.cooperationDirections}>
              {vacancies.map((vacancy) => (
                <article className={`${siteStyles.card} ${siteStyles.cooperationCard}`} key={vacancy.id}>
                  <h3>{vacancy.title}</h3>
                  <p className={siteStyles.cooperationLocation}>{copy.location}: {vacancy.location}</p>
                  <p>{vacancy.description}</p>
                  {vacancy.requirements ? (
                    <div className={siteStyles.cooperationRequirements}>
                      <strong>{copy.requirements}</strong>
                      <p>{vacancy.requirements}</p>
                    </div>
                  ) : null}
                  <button className={buttonStyles.primary} onClick={() => chooseDirection(vacancy.id)} type="button">
                    {copy.discuss}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <article className={`${siteStyles.card} ${siteStyles.cooperationFallback}`}>
              <h3>{copy.fallbackTitle}</h3>
              <p>{copy.fallbackText}</p>
              <button className={buttonStyles.primary} onClick={() => chooseDirection()} type="button">{copy.discuss}</button>
            </article>
          )}
        </div>
      </section>
      <section className={siteStyles.sectionAlt} id="cooperation-form">
        <div className={`${siteStyles.container} ${siteStyles.cooperationFormLayout}`}>
          <div>
            <p className={siteStyles.eyebrow}>{copy.formTitle}</p>
            <h2 className={siteStyles.heading}>{copy.formTitle}</h2>
            <p className={siteStyles.lead}>{copy.formIntro}</p>
          </div>
          <form className={styles.form} onSubmit={onSubmit}>
            <input name="vacancyId" type="hidden" value={selectedId} />
            <div className={styles.grid}>
              <label className={styles.field}><span>{copy.name} *</span><input name="name" required /></label>
              <label className={styles.field}><span>{copy.phone} *</span><input name="phone" required /></label>
              <label className={styles.field}><span>{copy.email} *</span><input name="email" required type="email" /></label>
              <label className={styles.field}><span>{copy.city} *</span><input name="city" required /></label>
              {selectedId ? (
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.selectedDirection}</span>
                  <input readOnly value={vacancies.find((vacancy) => vacancy.id === selectedId)?.title ?? ""} />
                </label>
              ) : null}
              {showDirectionQuestion ? (
                <div className={`${styles.directionQuestion} ${styles.wide}`}>
                  <p>{copy.positionQuestion}</p>
                  <div className={styles.directionOptions}>
                    {vacancies.map((vacancy) => (
                      <button
                        className={styles.directionOption}
                        key={vacancy.id}
                        onClick={() => chooseDirection(vacancy.id)}
                        type="button"
                      >
                        {vacancy.title}
                      </button>
                    ))}
                    <button
                      aria-pressed={useCustomDirection}
                      className={styles.directionOption}
                      onClick={() => {
                        setSelectedId("");
                        setUseCustomDirection(true);
                      }}
                      type="button"
                    >
                      {copy.other}
                    </button>
                  </div>
                </div>
              ) : null}
              {useCustomDirection ? (
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.customDirection} *</span>
                  <textarea name="customDirection" required />
                </label>
              ) : null}
              <label className={`${styles.field} ${styles.wide}`}>
                <span>{copy.comment}</span>
                <textarea name="comment" />
              </label>
            </div>
            <button className={styles.button} disabled={pending} type="submit">
              {pending ? copy.sending : copy.discuss}
            </button>
            {message ? <p className={isError ? styles.error : styles.message}>{message}</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}
