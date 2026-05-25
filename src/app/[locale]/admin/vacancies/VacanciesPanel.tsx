"use client";

import type { CooperationApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { ConfirmSubmitButton, SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { deleteVacancy, saveVacancy, saveVacancyInline, updateCooperationApplicationStatus } from "../actions";

type ApplicationValue = {
  city: string;
  comment: string | null;
  createdAt: string;
  customDirection: string | null;
  email: string;
  id: string;
  name: string;
  phone: string;
  status: CooperationApplicationStatus;
  updatedAt: string;
  vacancyId: string | null;
};

type VacancyValue = {
  _count: { cooperationApplications: number };
  cooperationApplications: ApplicationValue[];
  createdAt: string;
  description: string;
  id: string;
  isPublished: boolean;
  location: string;
  requirements: string | null;
  salary: string | null;
  status: "ACTIVE" | "ARCHIVED";
  titleEn: string;
  titleUk: string;
  updatedAt: string;
};

type Props = {
  candidatePage: number;
  candidatePageCount: number;
  generalApplications: ApplicationValue[];
  generalPage: number;
  generalPageCount: number;
  initialCreateOpen: boolean;
  initialEditVacancyId?: string;
  initialVacancyId?: string;
  locale: string;
  message: { error?: string; success?: string };
  vacancies: VacancyValue[];
  vacancyPage: number;
  vacancyPageCount: number;
};

const applicationStatuses: Array<{ label: string; value: CooperationApplicationStatus }> = [
  { label: "Нова", value: "NEW" },
  { label: "Опрацьована", value: "CONTACTED" },
  { label: "В архіві", value: "ARCHIVED" },
];

function statusLabel(status: CooperationApplicationStatus) {
  return applicationStatuses.find((item) => item.value === status)!.label;
}

function hrefWithParams(locale: string, values: Record<string, string | number | undefined>, fragment?: string) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return `/${locale}/admin/vacancies?${params.toString()}${fragment ? `#${fragment}` : ""}`;
}

export function VacanciesPanel({
  candidatePage,
  candidatePageCount,
  generalApplications,
  generalPage,
  generalPageCount,
  initialCreateOpen,
  initialEditVacancyId,
  initialVacancyId,
  locale,
  message,
  vacancies,
  vacancyPage,
  vacancyPageCount,
}: Props) {
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [openVacancyId, setOpenVacancyId] = useState<string | undefined>(initialVacancyId);
  const [editVacancyId, setEditVacancyId] = useState<string | undefined>(initialEditVacancyId);
  const [openCandidateId, setOpenCandidateId] = useState<string | undefined>();
  const [openGeneralId, setOpenGeneralId] = useState<string | undefined>();
  const [feedback, setFeedback] = useState(message);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Вакансії та заявки на співпрацю</h2>
          <p className={styles.muted}>Керуйте напрямами співпраці та контактами зацікавлених фахівців.</p>
        </div>
      </div>
      {feedback.success ? <p className={styles.success}>{feedback.success}</p> : null}
      {feedback.error ? <p className={styles.error}>{feedback.error}</p> : null}
      <div className={styles.toolbar}>
        <button
          aria-expanded={createOpen}
          className={styles.primaryButton}
          onClick={() => setCreateOpen((open) => !open)}
          type="button"
        >
          {createOpen ? "Сховати форму" : "Додати вакансію"}
        </button>
        <a className={styles.linkButton} href="#general-applications">Загальні заявки на співпрацю</a>
      </div>
      <AnimatedPanel open={createOpen}>
        <form action={saveVacancy} className={styles.form}>
          <h2>Нова вакансія</h2>
          <input name="locale" type="hidden" value={locale} />
          <input name="create" type="hidden" value="open" />
          <input name="generalPage" type="hidden" value={generalPage} />
          <input name="vacancyPage" type="hidden" value={vacancyPage} />
          <VacancyFields />
          <SubmitButton>Створити вакансію</SubmitButton>
        </form>
      </AnimatedPanel>
      <section className={styles.panel}>
        <h2>Створені вакансії</h2>
        {vacancies.length === 0 ? <p className={styles.empty}>Вакансій ще немає.</p> : (
          <>
            <div className={styles.vacancyGrid}>
              {vacancies.map((vacancy) => {
                const candidatesOpen = vacancy.id === openVacancyId;
                const editOpen = vacancy.id === editVacancyId;
                return (
                  <article className={`${styles.vacancyCard} ${candidatesOpen || editOpen ? styles.expandedCard : ""}`} key={vacancy.id}>
                    <div className={styles.vacancyHeader}>
                      <h3>{vacancy.titleUk}</h3>
                      <span className={vacancy.status === "ACTIVE" ? styles.activeTag : styles.archivedTag}>
                        {vacancy.status === "ACTIVE" ? "Активна" : "В архіві"}
                      </span>
                    </div>
                    <p className={styles.vacancyMeta}>{vacancy.location}{vacancy.salary ? ` · ${vacancy.salary}` : ""}</p>
                    <p className={styles.clampedText}>{vacancy.description}</p>
                    <p className={styles.applicationCount}>Заявок на співпрацю: <strong>{vacancy._count.cooperationApplications}</strong></p>
                    {vacancy.cooperationApplications.length ? (
                      <ul className={styles.applicationPreview}>
                        {vacancy.cooperationApplications.slice(0, 3).map((application) => (
                          <li key={application.id}>{application.name} <span>{application.phone}</span></li>
                        ))}
                      </ul>
                    ) : <p className={styles.muted}>Заявок поки немає.</p>}
                    <div className={styles.actions}>
                      <button
                        aria-expanded={candidatesOpen}
                        className={styles.linkButton}
                        onClick={() => {
                          setOpenVacancyId(candidatesOpen ? undefined : vacancy.id);
                          setOpenCandidateId(undefined);
                        }}
                        type="button"
                      >
                        {candidatesOpen ? "Сховати кандидатів" : "Переглянути кандидатів"}
                      </button>
                      <button
                        aria-expanded={editOpen}
                        className={styles.secondaryButton}
                        onClick={() => setEditVacancyId(editOpen ? undefined : vacancy.id)}
                        type="button"
                      >
                        {editOpen ? "Сховати редагування" : "Редагувати"}
                      </button>
                    </div>
                    <AnimatedPanel open={editOpen}>
                      <VacancyEditor
                        locale={locale}
                        onSaved={(success) => {
                          setEditVacancyId(undefined);
                          setFeedback({ success });
                        }}
                        vacancy={vacancy}
                      />
                    </AnimatedPanel>
                    <AnimatedPanel open={candidatesOpen}>
                      <section className={styles.candidates}>
                        <h3>Кандидати: {vacancy.titleUk}</h3>
                        {vacancy.cooperationApplications.length === 0 ? <p className={styles.empty}>Заявок на цей напрям немає.</p> : (
                          <div className={styles.applicationList}>
                            {vacancy.cooperationApplications.map((application) => (
                              <ApplicationAccordion
                                application={application}
                                candidatePage={vacancy.id === initialVacancyId ? candidatePage : 1}
                                direction={vacancy.titleUk}
                                generalPage={generalPage}
                                key={application.id}
                                locale={locale}
                                onToggle={() => setOpenCandidateId(openCandidateId === application.id ? undefined : application.id)}
                                open={openCandidateId === application.id}
                                selectedVacancyId={vacancy.id}
                                vacancyPage={vacancyPage}
                              />
                            ))}
                          </div>
                        )}
                        <Pagination
                          currentPage={vacancy.id === initialVacancyId ? candidatePage : 1}
                          href={(page) => hrefWithParams(locale, { candidatePage: page, generalPage, selectedVacancyId: vacancy.id, vacancyPage })}
                          label="Сторінки кандидатів"
                          pageCount={candidatesOpen && vacancy.id === initialVacancyId ? candidatePageCount : Math.max(1, Math.ceil(vacancy._count.cooperationApplications / 6))}
                        />
                      </section>
                    </AnimatedPanel>
                  </article>
                );
              })}
            </div>
            <Pagination
              currentPage={vacancyPage}
              href={(page) => hrefWithParams(locale, { generalPage, vacancyPage: page })}
              label="Сторінки вакансій"
              pageCount={vacancyPageCount}
            />
          </>
        )}
      </section>
      <section className={styles.panel} id="general-applications">
        <h2>Загальні заявки на співпрацю</h2>
        <p className={styles.muted}>Заявки з власним напрямом, без прив&apos;язки до конкретної вакансії.</p>
        {generalApplications.length === 0 ? <p className={styles.empty}>Загальних заявок ще немає.</p> : (
          <div className={styles.applicationList}>
            {generalApplications.map((application) => (
              <ApplicationAccordion
                application={application}
                direction={application.customDirection ?? "Інший напрям"}
                fragment="general-applications"
                generalPage={generalPage}
                key={application.id}
                locale={locale}
                onToggle={() => setOpenGeneralId(openGeneralId === application.id ? undefined : application.id)}
                open={openGeneralId === application.id}
                vacancyPage={vacancyPage}
              />
            ))}
          </div>
        )}
        <Pagination
          currentPage={generalPage}
          href={(page) => hrefWithParams(locale, { generalPage: page, vacancyPage }, "general-applications")}
          label="Сторінки загальних заявок"
          pageCount={generalPageCount}
        />
      </section>
    </div>
  );
}

function VacancyEditor({
  locale,
  onSaved,
  vacancy,
}: {
  locale: string;
  onSaved: (message: string) => void;
  vacancy: VacancyValue;
}) {
  const [state, action] = useActionState(saveVacancyInline, undefined);
  const reportedSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state?.success && reportedSuccess.current !== state.success) {
      reportedSuccess.current = state.success;
      onSaved(state.success);
    }
  }, [onSaved, state]);

  return (
    <form action={action} className={styles.form}>
      <input name="id" type="hidden" value={vacancy.id} />
      <input name="locale" type="hidden" value={locale} />
      <VacancyFields vacancy={vacancy} />
      {state?.error ? <p className={styles.error}>{state.error}</p> : null}
      <div className={styles.actions}>
        <SubmitButton>Зберегти</SubmitButton>
        <ConfirmSubmitButton action={deleteVacancy} message="Видалити вакансію та її заявки?">Видалити</ConfirmSubmitButton>
      </div>
    </form>
  );
}

function AnimatedPanel({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <div aria-hidden={!open} className={styles.accordionBody} data-open={open} inert={!open ? true : undefined}>
      <div className={styles.accordionInner}>{children}</div>
    </div>
  );
}

function ApplicationAccordion({
  application,
  candidatePage,
  direction,
  fragment,
  generalPage,
  locale,
  onToggle,
  open,
  selectedVacancyId,
  vacancyPage,
}: {
  application: ApplicationValue;
  candidatePage?: number;
  direction: string;
  fragment?: string;
  generalPage: number;
  locale: string;
  onToggle: () => void;
  open: boolean;
  selectedVacancyId?: string;
  vacancyPage: number;
}) {
  return (
    <article className={styles.applicationAccordion}>
      <button aria-expanded={open} className={styles.applicationSummary} onClick={onToggle} type="button">
        <span><strong>{application.name}</strong><small>{application.phone}</small></span>
        <span className={styles.statusTag}>{statusLabel(application.status)}</span>
        <b aria-hidden="true">{open ? "-" : "+"}</b>
      </button>
      <AnimatedPanel open={open}>
        <div className={styles.applicationDetails}>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Місто:</strong> {application.city}</p>
          <p><strong>Напрям:</strong> {direction}</p>
          <p className={styles.details}><strong>Коментар:</strong> {application.comment || "Коментар відсутній"}</p>
          <p><strong>Дата:</strong> {new Date(application.createdAt).toLocaleString("uk-UA")}</p>
          <form action={updateCooperationApplicationStatus} className={styles.actions}>
            <input name="id" type="hidden" value={application.id} />
            <input name="locale" type="hidden" value={locale} />
            <input name="vacancyPage" type="hidden" value={vacancyPage} />
            <input name="generalPage" type="hidden" value={generalPage} />
            <input name="selectedVacancyId" type="hidden" value={selectedVacancyId ?? ""} />
            <input name="candidatePage" type="hidden" value={candidatePage ?? ""} />
            <input name="fragment" type="hidden" value={fragment ?? ""} />
            <select aria-label="Статус заявки" defaultValue={application.status} name="status">
              {applicationStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <SubmitButton pendingLabel="...">Зберегти</SubmitButton>
          </form>
        </div>
      </AnimatedPanel>
    </article>
  );
}

function VacancyFields({ vacancy }: { vacancy?: VacancyValue }) {
  return (
    <div className={styles.fields}>
      <label>Назва українською<input defaultValue={vacancy?.titleUk} name="titleUk" required /></label>
      <label>Назва англійською<input defaultValue={vacancy?.titleEn} name="titleEn" required /></label>
      <label>Локація<input defaultValue={vacancy?.location} name="location" required /></label>
      <label>Зарплата<input defaultValue={vacancy?.salary ?? ""} name="salary" /></label>
      <label>Опис<textarea defaultValue={vacancy?.description} name="description" required /></label>
      <label>Вимоги<textarea defaultValue={vacancy?.requirements ?? ""} name="requirements" /></label>
      <label>Статус
        <select defaultValue={vacancy?.status ?? "ACTIVE"} name="status">
          <option value="ACTIVE">Активна</option>
          <option value="ARCHIVED">В архіві</option>
        </select>
      </label>
    </div>
  );
}

function Pagination({
  currentPage,
  href,
  label,
  pageCount,
}: {
  currentPage: number;
  href: (page: number) => string;
  label: string;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className={styles.pagination}>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Link aria-current={page === currentPage ? "page" : undefined} href={href(page)} key={page}>
          {page}
        </Link>
      ))}
    </nav>
  );
}
