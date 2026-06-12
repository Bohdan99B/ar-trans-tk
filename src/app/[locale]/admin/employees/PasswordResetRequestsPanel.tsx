"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import adminStyles from "../Admin.module.css";
import styles from "./PasswordResetRequests.module.css";

export type PasswordResetMessages = {
  actionError: string;
  cancel: string;
  cancelling: string;
  completedAt: string;
  copied: string;
  copy: string;
  copyError: string;
  createLink: string;
  createdAt: string;
  creatingLink: string;
  description: string;
  empty: string;
  expiresAt: string;
  handledBy: string;
  hideDetails: string;
  linkError: string;
  linkTitle: string;
  loadError: string;
  loading: string;
  noName: string;
  notAssigned: string;
  notYet: string;
  notificationError: string;
  paginationLabel: string;
  statusCancelled: string;
  statusCompleted: string;
  statusExpired: string;
  statusFailed: string;
  statusNew: string;
  statusViewed: string;
  technicalDetails: string;
  title: string;
  viewMore: string;
  viewedAt: string;
};

type ResetStatus = "NEW" | "VIEWED" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "FAILED";

type ResetRequest = {
  completedAt: string | null;
  createdAt: string;
  email: string;
  emailError: string | null;
  events: {
    actor: { name: string | null } | null;
    createdAt: string;
    details: string | null;
    id: string;
    type: string;
  }[];
  expiresAt: string;
  handledAt: string | null;
  handledBy: { name: string | null } | null;
  id: string;
  invitation: { status: string } | null;
  role: "OWNER" | "ADMIN" | "MANAGER";
  status: ResetStatus;
  user: { id: string; name: string | null };
  viewedAt: string | null;
};

export function PasswordResetRequestsPanel({
  locale,
  messages,
}: {
  locale: string;
  messages: PasswordResetMessages;
}) {
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const loadSequence = useRef(0);

  const loadRequests = useCallback(async () => {
    const sequence = ++loadSequence.current;
    const query = new URLSearchParams({ page: String(currentPage) });
    const response = await fetch(`/api/admin/password-reset-requests?${query}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (sequence !== loadSequence.current) return;
    if (!response.ok) {
      setError(messages.loadError);
      setIsLoading(false);
      return;
    }
    const nextRequests = (payload.requests ?? []) as ResetRequest[];
    const nextPage = Number(payload.page) || 1;
    const nextPageCount = Number(payload.pageCount) || 1;
    setRequests(nextRequests);
    setCurrentPage(nextPage);
    setPageCount(nextPageCount);
    setExpandedId((currentId) => (
      currentId && nextRequests.some((item) => item.id === currentId) ? currentId : null
    ));
    setError(null);
    setIsLoading(false);
    window.dispatchEvent(
      new CustomEvent("password-reset-updated", {
        detail: {
          activeCount: payload.activeCount ?? 0,
          statuses: payload.statuses ?? {},
        },
      }),
    );
  }, [currentPage, messages.loadError]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadRequests, 0);
    const interval = window.setInterval(loadRequests, 10_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadRequests]);

  async function updateRequest(item: ResetRequest, action: "view" | "cancel") {
    const response = await fetch(`/api/admin/password-reset-requests/${item.id}`, {
      body: JSON.stringify({ action }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) {
      setError(messages.actionError);
      return false;
    }
    await loadRequests();
    return true;
  }

  async function toggleRequest(item: ResetRequest) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (item.status === "NEW") {
      await updateRequest(item, "view");
    }
  }

  async function createManagerLink(item: ResetRequest) {
    setPendingId(item.id);
    setError(null);
    setNotice(null);
    setInviteUrl(null);
    const response = await fetch(`/api/admin/employees/${item.user.id}/reset-password`, {
      body: JSON.stringify({ locale, requestId: item.id }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);
    setPendingId(null);
    if (!response.ok) {
      setError(messages.linkError);
      return;
    }
    setInviteUrl(payload.inviteUrl);
    await loadRequests();
  }

  async function cancelRequest(item: ResetRequest) {
    setPendingId(item.id);
    setError(null);
    await updateRequest(item, "cancel");
    setPendingId(null);
  }

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setNotice(messages.copied);
    } catch {
      setError(messages.copyError);
    }
  }

  function changePage(page: number) {
    if (page === currentPage) return;
    setExpandedId(null);
    setCurrentPage(page);
  }

  const statusLabels: Record<ResetStatus, string> = {
    CANCELLED: messages.statusCancelled,
    COMPLETED: messages.statusCompleted,
    EXPIRED: messages.statusExpired,
    FAILED: messages.statusFailed,
    NEW: messages.statusNew,
    VIEWED: messages.statusViewed,
  };

  if (isLoading) return <p>{messages.loading}</p>;

  return (
    <section className={styles.panel}>
      <div>
        <h2>{messages.title}</h2>
        <p className={styles.description}>{messages.description}</p>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {notice ? <p className={styles.success} role="status">{notice}</p> : null}
      {inviteUrl ? (
        <div className={styles.inviteBox}>
          <strong>{messages.linkTitle}</strong>
          <a href={inviteUrl}>{inviteUrl}</a>
          <button className={adminStyles.primaryButton} onClick={copyInviteUrl} type="button">
            {messages.copy}
          </button>
        </div>
      ) : null}
      {requests.length === 0 ? <p className={styles.empty}>{messages.empty}</p> : (
        <>
          <div className={styles.list}>
            {requests.map((item) => {
              const isExpanded = expandedId === item.id;
              const isActive = item.status === "NEW" || item.status === "VIEWED";
              return (
                <article className={styles.request} data-unread={item.status === "NEW"} key={item.id}>
                  <div className={styles.requestHeader}>
                    <div>
                      <h3>{item.user.name ?? messages.noName}</h3>
                      <p>{item.email}</p>
                    </div>
                    <span className={styles.status} data-status={item.status}>{statusLabels[item.status]}</span>
                    <button
                      className={`${adminStyles.secondaryButton} ${styles.moreButton}`}
                      onClick={() => toggleRequest(item)}
                      type="button"
                    >
                      {isExpanded ? messages.hideDetails : messages.viewMore}
                    </button>
                  </div>
                  {isExpanded ? (
                    <div className={styles.details}>
                      <dl className={styles.meta}>
                        <div><dt>{messages.createdAt}</dt><dd>{formatDate(item.createdAt, locale)}</dd></div>
                        <div><dt>{messages.expiresAt}</dt><dd>{formatDate(item.expiresAt, locale)}</dd></div>
                        <div><dt>{messages.viewedAt}</dt><dd>{item.viewedAt ? formatDate(item.viewedAt, locale) : messages.notYet}</dd></div>
                        <div><dt>{messages.handledBy}</dt><dd>{item.handledBy?.name ?? messages.notAssigned}</dd></div>
                        <div><dt>{messages.completedAt}</dt><dd>{item.completedAt ? formatDate(item.completedAt, locale) : messages.notYet}</dd></div>
                      </dl>
                      <div className={styles.actions}>
                        {item.role === "MANAGER" && isActive ? (
                          <button
                            className={adminStyles.primaryButton}
                            disabled={pendingId === item.id}
                            onClick={() => createManagerLink(item)}
                            type="button"
                          >
                            {pendingId === item.id ? messages.creatingLink : messages.createLink}
                          </button>
                        ) : null}
                        {isActive ? (
                          <button
                            className={adminStyles.dangerButton}
                            disabled={pendingId === item.id}
                            onClick={() => cancelRequest(item)}
                            type="button"
                          >
                            {pendingId === item.id ? messages.cancelling : messages.cancel}
                          </button>
                        ) : null}
                      </div>
                      {item.emailError || item.events.some((event) => event.details) ? (
                        <details>
                          <summary>{messages.technicalDetails}</summary>
                          {item.emailError ? <p className={styles.warning}>{messages.notificationError}: {item.emailError}</p> : null}
                          <ul className={styles.events}>
                            {item.events.filter((event) => event.details).map((event) => (
                              <li key={event.id}>
                                {formatDate(event.createdAt, locale)} · {event.details}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <nav aria-label={messages.paginationLabel} className={styles.pagination}>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  aria-current={page === currentPage ? "page" : undefined}
                  key={page}
                  onClick={() => changePage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
