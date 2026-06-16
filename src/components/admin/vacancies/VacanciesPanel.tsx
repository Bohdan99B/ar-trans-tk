"use client";

import type { CooperationApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/AdminControls";
import styles from "@/components/admin/Admin.module.css";
import { deleteVacancy, saveVacancy, saveVacancyInline, updateCooperationApplicationStatus } from "@/server/actions/admin";

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

type VacancyApplicationValue = {
  comment: string | null;
  createdAt: string;
  cvUrl: string | null;
  email: string | null;
  id: string;
  name: string;
  phone: string;
  vacancyId: string;
};

type VacancyValue = {
  _count: { applications: number; cooperationApplications: number };
  applications: VacancyApplicationValue[];
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

type VacancyUpdate = Pick<
  VacancyValue,
  "description" | "id" | "isPublished" | "location" | "requirements" | "salary" | "status" | "titleEn" | "titleUk" | "updatedAt"
>;

type Props = {
  candidatePage: number;
  candidatePageCount: number;
  canManage: boolean;
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

const applicationDateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "Europe/Kyiv",
});

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
  canManage,
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
  const [createOpen, setCreateOpen] = useState(canManage && initialCreateOpen);
  const [openVacancyId, setOpenVacancyId] = useState<string | undefined>(initialVacancyId);
  const [editVacancyId, setEditVacancyId] = useState<string | undefined>(canManage ? initialEditVacancyId : undefined);
  const [openCandidateId, setOpenCandidateId] = useState<string | undefined>();
  const [openGeneralId, setOpenGeneralId] = useState<string | undefined>();
  const [feedback, setFeedback] = useState(message);
  const [vacancyUpdates, setVacancyUpdates] = useState<Record<string, VacancyUpdate>>({});
  const visibleVacancies = vacancies.map((vacancy) => (
    vacancyUpdates[vacancy.id] ? { ...vacancy, ...vacancyUpdates[vacancy.id] } : vacancy
  ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Вакансії та заявки на співпрацю</h2>
          <p className={styles.muted}>{canManage ? "Керуйте напрямами співпраці та контактами зацікавлених фахівців." : "Перегляд вакансій і заявок на співпрацю."}</p>
        </div>
      </div>
      {feedback.success ? <p className={styles.success}>{feedback.success}</p> : null}
      {feedback.error ? <p className={styles.error}>{feedback.error}</p> : null}
      <div className={styles.toolbar}>
        {canManage ? (
        <button
          aria-expanded={createOpen}
          className={styles.primaryButton}
          onClick={() => setCreateOpen((open) => !open)}
          type="button"
        >
          {createOpen ? "Сховати форму" : "Додати вакансію"}
        </button>
        ) : null}
        <a className={styles.linkButton} href="#general-applications">Загальні заявки на співпрацю</a>
      </div>
      {canManage ? <AnimatedPanel open={createOpen}>
        <form action={saveVacancy} className={styles.form}>
          <h2>Нова вакансія</h2>
          <input name="locale" type="hidden" value={locale} />
          <input name="create" type="hidden" value="open" />
          <input name="generalPage" type="hidden" value={generalPage} />
          <input name="vacancyPage" type="hidden" value={vacancyPage} />
          <VacancyFields />
          <SubmitButton>Створити вакансію</SubmitButton>
        </form>
      </AnimatedPanel> : null}
      <section className={styles.panel}>
        <h2>Створені вакансії</h2>
        {visibleVacancies.length === 0 ? <p className={styles.empty}>Вакансій ще немає.</p> : (
          <>
            <div className={styles.vacancyGrid}>
              {visibleVacancies.map((vacancy) => {
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
                    <p className={styles.applicationCount}>
                      Відгуків на вакансію: <strong>{vacancy._count.applications}</strong>
                      {" · "}
                      Заявок на співпрацю: <strong>{vacancy._count.cooperationApplications}</strong>
                    </p>
                    {vacancy.applications.length || vacancy.cooperationApplications.length ? (
                      <ul className={styles.applicationPreview}>
                        {vacancy.applications.slice(0, 3).map((application) => (
                          <li key={application.id}>{application.name} <span>{application.phone}</span></li>
                        ))}
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
                      {canManage ? <button
                        aria-expanded={editOpen}
                        className={styles.secondaryButton}
                        onClick={() => setEditVacancyId(editOpen ? undefined : vacancy.id)}
                        type="button"
                      >
                        {editOpen ? "Сховати редагування" : "Редагувати"}
                      </button> : null}
                    </div>
                    {canManage ? <AnimatedPanel open={editOpen}>
                      <VacancyEditor
                        locale={locale}
                        onSaved={(success, updatedVacancy) => {
                          setVacancyUpdates((current) => ({ ...current, [updatedVacancy.id]: updatedVacancy }));
                          setEditVacancyId(undefined);
                          setFeedback({ success });
                        }}
                        vacancy={vacancy}
                      />
                    </AnimatedPanel> : null}
                    <AnimatedPanel open={candidatesOpen}>
                      <section className={styles.candidates}>
                        <h3>Кандидати: {vacancy.titleUk}</h3>
                        {vacancy.applications.length === 0 && vacancy.cooperationApplications.length === 0 ? <p className={styles.empty}>Заявок на цей напрям немає.</p> : (
                          <div className={styles.applicationList}>
                            {vacancy.applications.map((application) => (
                              <VacancyApplicationAccordion
                                application={application}
                                key={application.id}
                                onToggle={() => setOpenCandidateId(openCandidateId === application.id ? undefined : application.id)}
                                open={openCandidateId === application.id}
                              />
                            ))}
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
                                canManage={canManage}
                              />
                            ))}
                          </div>
                        )}
                        <Pagination
                          currentPage={vacancy.id === initialVacancyId ? candidatePage : 1}
                          href={(page) => hrefWithParams(locale, { candidatePage: page, generalPage, selectedVacancyId: vacancy.id, vacancyPage })}
                          label="Сторінки кандидатів"
                          pageCount={candidatesOpen && vacancy.id === initialVacancyId ? candidatePageCount : Math.max(1, Math.ceil(Math.max(vacancy._count.applications, vacancy._count.cooperationApplications) / 6))}
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
                canManage={canManage}
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
  onSaved: (message: string, vacancy: VacancyUpdate) => void;
  vacancy: VacancyValue;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();

  async function save(data: FormData) {
    setError(undefined);
    const submittedVacancy: VacancyUpdate = {
      description: String(data.get("description") ?? ""),
      id: vacancy.id,
      isPublished: data.get("status") === "ACTIVE",
      location: String(data.get("location") ?? ""),
      requirements: String(data.get("requirements") ?? "") || null,
      salary: String(data.get("salary") ?? "") || null,
      status: data.get("status") === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
      titleEn: String(data.get("titleEn") ?? ""),
      titleUk: String(data.get("titleUk") ?? ""),
      updatedAt: new Date().toISOString(),
    };
    onSaved("Вакансію збережено", submittedVacancy);

    const result = await saveVacancyInline(undefined, data);
    if (result.error) {
      onSaved("", {
        description: vacancy.description,
        id: vacancy.id,
        isPublished: vacancy.isPublished,
        location: vacancy.location,
        requirements: vacancy.requirements,
        salary: vacancy.salary,
        status: vacancy.status,
        titleEn: vacancy.titleEn,
        titleUk: vacancy.titleUk,
        updatedAt: vacancy.updatedAt,
      });
      setError(result.error);
      return;
    }
    if (result.success && result.vacancy) {
      onSaved(result.success, result.vacancy);
      router.refresh();
    }
  }

  return (
    <form action={save} className={styles.form}>
      <input name="id" type="hidden" value={vacancy.id} />
      <input name="locale" type="hidden" value={locale} />
      <VacancyFields vacancy={vacancy} />
      {error ? <p className={styles.error}>{error}</p> : null}
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

function VacancyApplicationAccordion({
  application,
  onToggle,
  open,
}: {
  application: VacancyApplicationValue;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <article className={styles.applicationAccordion}>
      <button aria-expanded={open} className={styles.applicationSummary} onClick={onToggle} type="button">
        <span><strong>{application.name}</strong><small>{application.phone}</small></span>
        <span className={styles.statusTag}>Відгук на вакансію</span>
        <b aria-hidden="true">{open ? "-" : "+"}</b>
      </button>
      <AnimatedPanel open={open}>
        <div className={styles.applicationDetails}>
          <p><strong>Електронна пошта:</strong> {application.email ?? "-"}</p>
          <p className={styles.details}><strong>Коментар:</strong> {application.comment || "Коментар відсутній"}</p>
          {application.cvUrl ? <p><strong>CV:</strong> <a href={application.cvUrl}>Відкрити файл</a></p> : null}
          <p><strong>Дата:</strong> {applicationDateFormatter.format(new Date(application.createdAt))}</p>
        </div>
      </AnimatedPanel>
    </article>
  );
}

function ApplicationAccordion({
  application,
  canManage,
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
  canManage: boolean;
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
          <p><strong>Електронна пошта:</strong> {application.email}</p>
          <p><strong>Місто:</strong> {application.city}</p>
          <p><strong>Напрям:</strong> {direction}</p>
          <p className={styles.details}><strong>Коментар:</strong> {application.comment || "Коментар відсутній"}</p>
          <p><strong>Дата:</strong> {applicationDateFormatter.format(new Date(application.createdAt))}</p>
          {canManage ? <form action={updateCooperationApplicationStatus} className={styles.actions}>
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
          </form> : null}
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
