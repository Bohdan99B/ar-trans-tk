import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireStaff } from "@/lib/auth";
import { getActionablePasswordResetWhere } from "@/lib/password-reset-requests";
import { prisma } from "@/lib/prisma";
import { ensureRequestStatuses } from "@/lib/requests";

import styles from "../Site.module.css";
import adminStyles from "./Admin.module.css";
import { PasswordResetDashboardCard } from "./PasswordResetDashboardCard";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 6;

function getPage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getRequestDetailsHref(locale: string, id: string, type: "ORDER" | "FAQ" | "CONSULTATION") {
  return `/${locale}/admin/requests?selectedId=${id}&view=${type === "ORDER" ? "applications" : "questions"}`;
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const user = await requireStaff();
  if (!user) {
    redirect(`/${locale}`);
  }
  const isAdmin = user.role === "ADMIN";
  const passwordResetTranslations = isAdmin
    ? await getTranslations({ locale, namespace: "passwordResetAdmin" })
    : null;
  await ensureRequestStatuses();
  const requestedPage = getPage(query.page);
  const requestWhere: Prisma.TransportRequestWhereInput = { type: "ORDER" };
  const messageWhere: Prisma.TransportRequestWhereInput = { type: { in: ["CONSULTATION", "FAQ"] } };
  const [
    newRequests,
    requestsDone,
    requestsInProgress,
    publishedVacancies,
    archivedVacancies,
    cooperationRequests,
    messagesDone,
    messagesPending,
    latestCount,
  ] = await Promise.all([
    prisma.transportRequest.count({ where: { ...requestWhere, status: { code: "new" } } }),
    prisma.transportRequest.count({ where: { ...requestWhere, status: { code: "completed" } } }),
    prisma.transportRequest.count({ where: { ...requestWhere, status: { code: "in_progress" } } }),
    prisma.vacancy.count({ where: { isPublished: true, status: "ACTIVE" } }),
    prisma.vacancy.count({ where: { OR: [{ isPublished: false }, { status: "ARCHIVED" }] } }),
    prisma.cooperationApplication.count({ where: { status: "NEW" } }),
    prisma.transportRequest.count({ where: { ...messageWhere, status: { code: "completed" } } }),
    prisma.transportRequest.count({ where: { ...messageWhere, status: { code: { in: ["new", "in_progress"] } } } }),
    prisma.transportRequest.count({ where: requestWhere }),
  ]);
  const [reviewsTotal, reviewsHidden, reviewsPending, reviewsPublished] = isAdmin
    ? await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { moderationStatus: "HIDDEN" } }),
      prisma.review.count({ where: { moderationStatus: "PENDING" } }),
      prisma.review.count({ where: { moderationStatus: "PUBLISHED" } }),
    ])
    : [0, 0, 0, 0];
  const passwordResetCount = isAdmin
    ? await prisma.passwordResetRequest.count({ where: getActionablePasswordResetWhere() })
    : 0;
  const pageCount = Math.max(1, Math.ceil(latestCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const latest = await prisma.transportRequest.findMany({
    include: { status: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    where: requestWhere,
  });

  return (
    <div className={adminStyles.page}>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h2>Заявки</h2>
          <dl className={adminStyles.metricBreakdown}>
            <div><dt>Нові</dt><dd>{newRequests}</dd></div>
            <div><dt>В роботі</dt><dd>{requestsInProgress}</dd></div>
            <div><dt>Опрацьовані</dt><dd>{requestsDone}</dd></div>
          </dl>
        </article>
        <article className={styles.card}>
          <h2>Вакансії</h2>
          <dl className={adminStyles.metricBreakdown}>
            <div><dt>Опубліковані вакансії</dt><dd>{publishedVacancies}</dd></div>
            <div><dt>Архів вакансій</dt><dd>{archivedVacancies}</dd></div>
            <div><dt>Запит на співпрацю</dt><dd>{cooperationRequests}</dd></div>
          </dl>
        </article>
        <article className={styles.card}>
          <h2>Повідомлення</h2>
          <dl className={adminStyles.metricBreakdown}>
            <div><dt>Опрацьовані</dt><dd>{messagesDone}</dd></div>
            <div><dt>Не опрацьовані</dt><dd>{messagesPending}</dd></div>
          </dl>
        </article>
        {isAdmin ? <article className={styles.card}>
          <h2 className={adminStyles.metricHeading}>
            <span>Відгуки</span>
            <strong>{reviewsTotal}</strong>
          </h2>
          <dl className={adminStyles.metricBreakdown}>
            <div><dt>Приховано</dt><dd>{reviewsHidden}</dd></div>
            <div><dt>Очікує</dt><dd>{reviewsPending}</dd></div>
            <div><dt>Опубліковано</dt><dd>{reviewsPublished}</dd></div>
          </dl>
        </article> : null}
        {isAdmin && passwordResetTranslations ? (
          <PasswordResetDashboardCard
            action={passwordResetTranslations("dashboardAction")}
            description={passwordResetTranslations("dashboardDescription")}
            href={`/${locale}/admin/employees`}
            initialCount={passwordResetCount}
            title={passwordResetTranslations("dashboardTitle")}
          />
        ) : null}
      </div>
      <section className={adminStyles.panel}>
        <h2>Швидкі дії</h2>
        <div className={adminStyles.actions}>
          <Link className={adminStyles.linkButton} href={`/${locale}/admin/requests`}>Перейти до заявок</Link>
          <Link className={adminStyles.linkButton} href={`/${locale}/admin/vacancies`}>{isAdmin ? "Керувати вакансіями" : "Переглянути вакансії"}</Link>
          <Link className={adminStyles.linkButton} href={`/${locale}/admin/fleet`}>Перейти до автопарку</Link>
          {isAdmin ? <Link className={adminStyles.linkButton} href={`/${locale}/admin/settings`}>Налаштування</Link> : null}
        </div>
      </section>
      <section className={adminStyles.panel}>
        <h2>Останні заявки</h2>
        {latest.length === 0 ? <p className={adminStyles.empty}>Заявок ще немає.</p> : (
          <>
            <div className={adminStyles.tableWrap}>
              <table className={adminStyles.table}>
                <thead><tr><th>Номер</th><th>Клієнт</th><th>Статус</th><th>Дата</th></tr></thead>
                <tbody>
                  {latest.map((item) => (
                    <tr className={adminStyles.clickableRow} key={item.id}>
                      <td>
                        <Link
                          aria-label={`Переглянути заявку ${item.requestNumber}`}
                          className={adminStyles.rowLink}
                          href={getRequestDetailsHref(locale, item.id, item.type)}
                        >
                          {item.requestNumber}
                        </Link>
                      </td>
                      <td>
                        <Link
                          aria-hidden="true"
                          className={adminStyles.rowLink}
                          href={getRequestDetailsHref(locale, item.id, item.type)}
                          tabIndex={-1}
                        >
                          {item.name}<br />{item.phone}
                        </Link>
                      </td>
                      <td>
                        <Link
                          aria-hidden="true"
                          className={adminStyles.rowLink}
                          href={getRequestDetailsHref(locale, item.id, item.type)}
                          tabIndex={-1}
                        >
                          {item.status.titleUk}
                        </Link>
                      </td>
                      <td>
                        <Link
                          aria-hidden="true"
                          className={adminStyles.rowLink}
                          href={getRequestDetailsHref(locale, item.id, item.type)}
                          tabIndex={-1}
                        >
                          {item.createdAt.toLocaleDateString("uk-UA")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              href={(page) => `/${locale}/admin?page=${page}`}
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
    <nav aria-label="Сторінки останніх заявок" className={adminStyles.pagination}>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Link aria-current={page === currentPage ? "page" : undefined} href={href(page)} key={page}>
          {page}
        </Link>
      ))}
    </nav>
  );
}
