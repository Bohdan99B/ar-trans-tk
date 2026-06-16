"use client";

import { useState } from "react";

import { FieldErrors, getFieldErrors } from "@/lib/validations";
import { adminContactSchema, adminOfficeContactSchema, maskAdminPhone } from "@/lib/validations";

import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/AdminControls";
import styles from "@/components/admin/Admin.module.css";
import { deleteManager, saveDirector, saveManager, saveOffice } from "@/server/actions/admin";

type ContactValue = {
  email: string;
  messengers: string[];
  name: string;
  phone: string;
  role: string;
};

type OfficeValue = ContactValue & {
  hours: string;
  recipientEmail: string;
};

type ManagerValue = ContactValue & {
  id: string;
};

const messengerOptions = ["Telegram", "Viber", "WhatsApp"] as const;

export function SettingsContactsPanel({
  contacts,
  director,
  locale,
  office,
}: {
  contacts: ManagerValue[];
  director: ContactValue;
  locale: string;
  office: OfficeValue;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className={styles.panel}>
      <div className={styles.contactHeading}>
        <div>
          <h2>Контакти</h2>
          <p className={styles.muted}>Картки контактів, які бачать відвідувачі сайту.</p>
        </div>
        <button
          aria-expanded={open === "create"}
          className={styles.secondaryButton}
          onClick={() => setOpen(open === "create" ? null : "create")}
          type="button"
        >
          Додати контактні дані
        </button>
      </div>

      <div className={styles.primaryContactCards}>
        <ContactAccordion
          contact={director}
          label="Директор"
          locale={locale}
          onToggle={() => setOpen(open === "director" ? null : "director")}
          open={open === "director"}
          roleLabel="Посада"
          saveAction={saveDirector}
        />
        <ContactAccordion
          contact={office}
          label="Офіс"
          locale={locale}
          onToggle={() => setOpen(open === "office" ? null : "office")}
          open={open === "office"}
          roleLabel="Опис"
          saveAction={saveOffice}
        />
      </div>

      <AnimatedPanel open={open === "create"}>
        <ContactForm locale={locale} saveAction={saveManager} submitLabel="Додати контакт" />
      </AnimatedPanel>

      <div className={styles.contactCards}>
        {contacts.length === 0 ? <p className={styles.empty}>Додаткових контактів ще немає.</p> : null}
        {contacts.map((contact) => (
          <ContactAccordion
            contact={contact}
            key={contact.id}
            label="Працівник"
            locale={locale}
            onToggle={() => setOpen(open === contact.id ? null : contact.id)}
            open={open === contact.id}
            saveAction={saveManager}
          />
        ))}
      </div>
    </section>
  );
}

function ContactAccordion({
  contact,
  label,
  locale,
  onToggle,
  open,
  roleLabel = "Опис посади",
  saveAction,
}: {
  contact: ContactValue | ManagerValue | OfficeValue;
  label: string;
  locale: string;
  onToggle: () => void;
  open: boolean;
  roleLabel?: string;
  saveAction: (data: FormData) => Promise<void>;
}) {
  return (
    <article className={`${styles.applicationAccordion} ${styles.contactAccordion} ${open ? styles.contactAccordionOpen : ""}`}>
      <button aria-expanded={open} className={styles.applicationSummary} onClick={onToggle} type="button">
        <span><strong>{contact.name}</strong><small>{contact.role}</small></span>
        <span className={styles.statusTag}>{label}</span>
        <b aria-hidden="true">{open ? "-" : "+"}</b>
      </button>
      <AnimatedPanel open={open}>
        <ContactForm
          contact={contact}
          locale={locale}
          roleLabel={roleLabel}
          saveAction={saveAction}
          submitLabel="Зберегти зміни"
        />
      </AnimatedPanel>
    </article>
  );
}

function AnimatedPanel({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <div aria-hidden={!open} className={styles.accordionBody} data-open={open} inert={!open ? true : undefined}>
      <div className={styles.accordionInner}>{children}</div>
    </div>
  );
}

function ContactForm({
  contact,
  locale,
  roleLabel = "Опис посади",
  saveAction,
  submitLabel,
}: {
  contact?: ContactValue | ManagerValue | OfficeValue;
  locale: string;
  roleLabel?: string;
  saveAction: (data: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const isManager = Boolean(contact && "id" in contact);
  const isOffice = Boolean(contact && "recipientEmail" in contact);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validateContact(event: React.FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;

    if (submitter?.dataset.skipValidation) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const values = {
      email: String(formData.get("email") ?? ""),
      hours: String(formData.get("hours") ?? ""),
      messengers: formData.getAll("messengers").map(String),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      recipientEmail: String(formData.get("recipientEmail") ?? ""),
      role: String(formData.get("role") ?? ""),
    };
    const parsed = (isOffice ? adminOfficeContactSchema : adminContactSchema).safeParse(values);

    if (!parsed.success) {
      event.preventDefault();
      setErrors(getFieldErrors(parsed.error));
      return;
    }

    setErrors({});
  }

  return (
    <form action={saveAction} className={styles.contactEditForm} noValidate onSubmit={validateContact}>
      <input name="locale" type="hidden" value={locale} />
      {isManager ? <input name="id" type="hidden" value={(contact as ManagerValue).id} /> : null}
      <div className={styles.fields}>
        <label>
          Назва/ім&apos;я
          <input aria-describedby="admin-contact-name-error" aria-invalid={Boolean(errors.name)} defaultValue={contact?.name ?? ""} name="name" required />
          <span className={styles.fieldError} data-visible={Boolean(errors.name)} id="admin-contact-name-error">{errors.name}</span>
        </label>
        <label>
          {roleLabel}
          <input aria-describedby="admin-contact-role-error" aria-invalid={Boolean(errors.role)} defaultValue={contact?.role ?? ""} name="role" required />
          <span className={styles.fieldError} data-visible={Boolean(errors.role)} id="admin-contact-role-error">{errors.role}</span>
        </label>
        <label>
          Номер телефону
          <input
            aria-describedby="admin-contact-phone-error"
            aria-invalid={Boolean(errors.phone)}
            defaultValue={contact?.phone ?? ""}
            inputMode="tel"
            name="phone"
            onChange={(event) => {
              event.currentTarget.value = maskAdminPhone(event.currentTarget.value);
            }}
            placeholder="+38 (067) 674 0411"
            required
          />
          <span className={styles.fieldError} data-visible={Boolean(errors.phone)} id="admin-contact-phone-error">{errors.phone}</span>
        </label>
        <label>
          Пошта
          <input aria-describedby="admin-contact-email-error" aria-invalid={Boolean(errors.email)} defaultValue={contact?.email ?? ""} name="email" required type="email" />
          <span className={styles.fieldError} data-visible={Boolean(errors.email)} id="admin-contact-email-error">{errors.email}</span>
        </label>
        {isOffice ? (
          <>
            <input name="recipientEmail" type="hidden" value={(contact as OfficeValue).recipientEmail} />
            <label>
              Графік роботи
              <input aria-describedby="admin-contact-hours-error" aria-invalid={Boolean(errors.hours)} defaultValue={(contact as OfficeValue).hours} name="hours" required />
              <span className={styles.fieldError} data-visible={Boolean(errors.hours)} id="admin-contact-hours-error">{errors.hours}</span>
            </label>
          </>
        ) : null}
        <MessengerSelect selected={contact?.messengers ?? []} />
      </div>
      <div className={styles.actions}>
        <SubmitButton>{submitLabel}</SubmitButton>
        {isManager ? (
          <ConfirmSubmitButton action={deleteManager} message="Видалити цю контактну картку?">Видалити</ConfirmSubmitButton>
        ) : null}
      </div>
    </form>
  );
}

function MessengerSelect({ selected }: { selected: string[] }) {
  return (
    <div className={styles.fieldGroup}>
      <span>Месенджери</span>
      <details className={styles.multiSelect}>
        <summary>{selected.length ? selected.join(", ") : "Обрати месенджери"}</summary>
        <div>
          {messengerOptions.map((messenger) => (
            <label className={styles.checkbox} key={messenger}>
              <input defaultChecked={selected.includes(messenger)} name="messengers" type="checkbox" value={messenger} />
              {messenger}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
