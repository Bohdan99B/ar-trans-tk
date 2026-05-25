import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ensureRequestStatuses } from "@/lib/requests";

import { SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { updateRequestStatus } from "../actions";

type RequestsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; page?: string; selectedId?: string; status?: string; success?: string; view?: string }>;
};

type View = "applications" | "questions";

const PAGE_SIZE = 6;
const questionLabels = {
  CONSULTATION: "Консультація",
  FAQ: "FAQ питання",
} as const;

function getPage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function createListHref(locale: string, view: View, page: number, status?: string) {
  const params = new URLSearchParams({ page: String(page), view });
  if (status) params.set("status", status);
  return `/${locale}/admin/requests?${params.toString()}`;
}

export default async function AdminRequestsPage({ params, searchParams }: RequestsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await ensureRequestStatuses();
  const selectedRequest = query.selectedId ? await prisma.transportRequest.findUnique({
    select: { createdAt: true, id: true, type: true },
    where: { id: query.selectedId },
  }) : null;
  const view: View = selectedRequest
    ? selectedRequest.type === "ORDER" ? "applications" : "questions"
    : query.view === "questions" ? "questions" : "applications";
  const statusFilter = selectedRequest ? undefined : query.status;
  const requestedPage = getPage(query.page);
  const where: Prisma.TransportRequestWhereInput = {
    ...(statusFilter ? { statusId: statusFilter } : {}),
    ...(view === "applications" ? { type: "ORDER" } : { type: { in: ["CONSULTATION", "FAQ"] } }),
  };
  const [total, statuses, itemsBeforeSelection] = await Promise.all([
    prisma.transportRequest.count({ where }),
    prisma.requestStatus.findMany({ orderBy: { sortOrder: "asc" } }),
    selectedRequest
      ? prisma.transportRequest.count({
          where: {
            ...where,
            OR: [
              { createdAt: { gt: selectedRequest.createdAt } },
              { createdAt: selectedRequest.createdAt, id: { gt: selectedRequest.id } },
            ],
          },
        })
      : Promise.resolve(null),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = itemsBeforeSelection === null ? Math.min(requestedPage, pageCount) : Math.floor(itemsBeforeSelection / PAGE_SIZE) + 1;
  const requests = await prisma.transportRequest.findMany({
    include: { status: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    where,
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Заявки та питання</h2>
          <p className={styles.muted}>Заявки на перевезення та повідомлення з інших форм сайту.</p>
        </div>
      </div>
      <nav aria-label="Тип звернень" className={styles.tabs}>
        <Link aria-current={view === "applications" ? "page" : undefined} href={createListHref(locale, "applications", 1, statusFilter)}>
          Заявки
        </Link>
        <Link aria-current={view === "questions" ? "page" : undefined} href={createListHref(locale, "questions", 1, statusFilter)}>
          Питання
        </Link>
      </nav>
      <section className={styles.panel}>
        <div className={styles.pageHeader}>
          <div>
            <h2>{view === "applications" ? "Заявки" : "Питання"}</h2>
            <p className={styles.muted}>
              {view === "applications"
                ? "Замовлення перевезення та основні заявки клієнтів."
                : "FAQ питання, консультації та інші повідомлення."}
            </p>
          </div>
          <form className={styles.filter}>
            <input name="view" type="hidden" value={view} />
            <label>
              Статус
              <select defaultValue={statusFilter ?? ""} name="status">
                <option value="">Усі</option>
                {statuses.map((status) => <option key={status.id} value={status.id}>{status.titleUk}</option>)}
              </select>
            </label>
            <button className={styles.primaryButton} type="submit">Фільтрувати</button>
          </form>
        </div>
        {query.success ? <p className={styles.success}>{query.success}</p> : null}
        {query.error ? <p className={styles.error}>{query.error}</p> : null}
        {requests.length === 0 ? (
          <p className={styles.empty}>{view === "applications" ? "Заявок за вибраними умовами немає." : "Питань за вибраними умовами немає."}</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Дата / номер</th><th>{view === "applications" ? "Клієнт" : "Тип і контакт"}</th><th>Перегляд</th><th>Статус</th></tr>
                </thead>
                <tbody>
                  {requests.map((item) => (
                    <tr className={item.id === selectedRequest?.id ? styles.selectedRow : undefined} key={item.id}>
                      <td>{item.createdAt.toLocaleString("uk-UA")}<br /><span className={styles.muted}>{item.requestNumber}</span></td>
                      <td>
                        {view === "questions" ? <><strong>{questionLabels[item.type as keyof typeof questionLabels]}</strong><br /></> : null}
                        {item.name}<br />{item.phone}<br />{item.email ?? "-"}
                      </td>
                      <td>
                        <details className={styles.requestDetails} open={item.id === selectedRequest?.id}>
                          <summary>Переглянути</summary>
                          {view === "applications" ? (
                            <p>{item.origin ?? "-"} {"->"} {item.destination ?? "-"}<br />{item.cargoType ?? "-"}, {item.temperatureMode ?? "-"}, {item.weight ?? "-"}</p>
                          ) : null}
                          <p>{item.comment || "Коментар відсутній"}</p>
                        </details>
                      </td>
                      <td>
                        <form action={updateRequestStatus} className={styles.actions}>
                          <input name="id" type="hidden" value={item.id} />
                          <input name="locale" type="hidden" value={locale} />
                          <input name="page" type="hidden" value={currentPage} />
                          <input name="selectedId" type="hidden" value={item.id === selectedRequest?.id ? item.id : ""} />
                          <input name="statusFilter" type="hidden" value={statusFilter ?? ""} />
                          <input name="view" type="hidden" value={view} />
                          <select defaultValue={item.statusId} name="statusId">
                            {statuses.map((status) => <option key={status.id} value={status.id}>{status.titleUk}</option>)}
                          </select>
                          <SubmitButton pendingLabel="...">Зберегти</SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              href={(page) => createListHref(locale, view, page, statusFilter)}
              pageCount={pageCount}
            />
          </>
        )}
      </section>
    </div>
  );
}

function Pagination({
  currentPage,
  href,
  pageCount,
}: {
  currentPage: number;
  href: (page: number) => string;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Сторінки звернень" className={styles.pagination}>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Link aria-current={page === currentPage ? "page" : undefined} href={href(page)} key={page}>
          {page}
        </Link>
      ))}
    </nav>
  );
}
