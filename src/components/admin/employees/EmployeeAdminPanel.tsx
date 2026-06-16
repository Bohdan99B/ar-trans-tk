"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { canDeleteEmployee, type EmployeeRole } from "@/lib/auth/employee-permissions";

import adminStyles from "@/components/admin/Admin.module.css";
import styles from "./Employees.module.css";

type Employee = {
  createdAt: string;
  email: string;
  id: string;
  isOwner: boolean;
  invitations: {
    expiresAt: string;
    id: string;
    status: string;
  }[];
  name: string | null;
  resetStatus: "NEW" | "VIEWED" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "FAILED" | null;
  role: EmployeeRole;
};

type EmployeeAdminPanelProps = {
  currentUser: {
    id: string;
    role: EmployeeRole;
  };
  employees: Employee[];
  locale: string;
  resetLabels: {
    accepted: string;
    completed: string;
    invitePending: string;
    requested: string;
    viewed: string;
  };
};

type Message = {
  tone: "error" | "success";
  text: string;
};

const roleLabels = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
};

export function EmployeeAdminPanel({ currentUser, employees, locale, resetLabels }: EmployeeAdminPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [resetStatuses, setResetStatuses] = useState<Record<string, Employee["resetStatus"]>>(
    Object.fromEntries(employees.map((employee) => [employee.id, employee.resetStatus])),
  );

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ statuses?: Record<string, Employee["resetStatus"]> }>).detail;
      if (detail?.statuses) setResetStatuses(detail.statuses);
    };
    window.addEventListener("password-reset-updated", handleUpdate);
    return () => window.removeEventListener("password-reset-updated", handleUpdate);
  }, []);

  async function createEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsCreating(true);
    setMessage(null);
    setInviteUrl(null);

    const formData = new FormData(form);
    const response = await fetch("/api/admin/employees", {
      body: JSON.stringify({
        email: formData.get("email"),
        locale,
        name: formData.get("name"),
        role: formData.get("role"),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);

    setIsCreating(false);
    if (!response.ok) {
      setMessage({ tone: "error", text: payload?.error ?? "Не вдалося створити запрошення" });
      return;
    }

    form.reset();
    setInviteUrl(payload.inviteUrl);
    setMessage({ tone: "success", text: "Запрошення створено" });
    router.refresh();
  }

  async function deleteEmployee() {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/employees/${pendingDelete.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setDeleteError(payload?.error ?? "Не вдалося видалити співробітника");
        return;
      }

      setPendingDelete(null);
      setMessage({ tone: "success", text: "Співробітника видалено" });
      router.refresh();
    } catch {
      setDeleteError("Не вдалося зв'язатися із сервером. Спробуйте ще раз.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function resetPassword(employee: Employee) {
    setIsResetting(employee.id);
    setMessage(null);
    setInviteUrl(null);
    const response = await fetch(`/api/admin/employees/${employee.id}/reset-password`, {
      body: JSON.stringify({ locale }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json().catch(() => null);
    setIsResetting(null);
    if (!response.ok) {
      setMessage({ tone: "error", text: payload?.error ?? "Не вдалося створити посилання для скидання" });
      return;
    }
    setInviteUrl(payload.inviteUrl);
    setMessage({ tone: "success", text: "Посилання для нового пароля створено" });
    router.refresh();
  }

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage({ tone: "success", text: "Посилання скопійовано" });
    } catch {
      setMessage({ tone: "error", text: "Не вдалося скопіювати посилання" });
    }
  }

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={createEmployee}>
        <div>
          <h2>Новий співробітник</h2>
          <p>Створюється акаунт без пароля. Співробітник задає пароль через invite-посилання.</p>
        </div>
        <label>
          Ім&apos;я
          <input name="name" required type="text" />
        </label>
        <label>
          Електронна пошта
          <input name="email" required type="email" />
        </label>
        <label>
          Роль
          <select defaultValue="MANAGER" name="role">
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <button className={`${adminStyles.primaryButton} ${styles.createButton}`} disabled={isCreating} type="submit">
          {isCreating ? "Створення..." : "Створити запрошення"}
        </button>
      </form>

      {message ? <p className={message.tone === "error" ? styles.error : styles.success}>{message.text}</p> : null}
      {inviteUrl ? (
        <div className={styles.inviteBox}>
          <span>Одноразове посилання для встановлення пароля:</span>
          <a href={inviteUrl}>{inviteUrl}</a>
          <button className={adminStyles.secondaryButton} onClick={copyInviteUrl} type="button">
            Копіювати посилання
          </button>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ім&apos;я</th>
              <th>Електронна пошта</th>
              <th>Роль</th>
              <th>Запрошення</th>
              <th>Дія</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const canDelete = canDeleteEmployee(currentUser, employee);
              const latestInvite = employee.invitations[0];
              const resetStatus = resetStatuses[employee.id];
              const employeeStatus =
                resetStatus === "NEW"
                  ? { label: resetLabels.requested, tone: "requested" }
                  : resetStatus === "VIEWED"
                    ? { label: resetLabels.viewed, tone: "viewed" }
                    : resetStatus === "COMPLETED"
                      ? { label: resetLabels.completed, tone: "completed" }
                      : {
                          label: latestInvite?.status === "PENDING" ? resetLabels.invitePending : resetLabels.accepted,
                          tone: "accepted",
                        };
              return (
                <tr key={employee.id}>
                  <td data-label="Ім'я">{employee.name ?? "Без імені"}</td>
                  <td data-label="Електронна пошта">{employee.email}</td>
                  <td data-label="Роль">{employee.isOwner ? "OWNER" : roleLabels[employee.role]}</td>
                  <td data-label="Запрошення">
                    <span className={styles.employeeStatus} data-tone={employeeStatus.tone}>
                      {employeeStatus.label}
                    </span>
                  </td>
                  <td data-label="Дія">
                    <div className={styles.employeeActions}>
                      <button
                        className={adminStyles.secondaryButton}
                        disabled={employee.isOwner || isResetting === employee.id}
                        onClick={() => resetPassword(employee)}
                        title={employee.isOwner ? "OWNER змінює пароль через email-відновлення" : undefined}
                        type="button"
                      >
                        {isResetting === employee.id ? "Створення..." : "Створити посилання для скидання"}
                      </button>
                      <button
                        className={adminStyles.dangerButton}
                        disabled={!canDelete}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(employee);
                        }}
                        title={
                          employee.id === currentUser.id
                            ? "Не можна видалити власний акаунт"
                            : employee.role === "OWNER" && currentUser.role === "ADMIN"
                              ? "ADMIN не може видалити OWNER"
                              : undefined
                        }
                        type="button"
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pendingDelete ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div aria-labelledby="delete-employee-title" aria-modal="true" className={styles.modal} role="dialog">
            <h2 id="delete-employee-title">Видалити співробітника?</h2>
            <p>
              Ви точно хочете видалити цього співробітника? Ця дія видалить акаунт та всі пов&apos;язані з ним дані з бази
              даних.
            </p>
            {deleteError ? (
              <p aria-live="assertive" className={styles.error} role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className={styles.modalActions}>
              <button
                className={adminStyles.secondaryButton}
                disabled={isDeleting}
                onClick={() => {
                  setDeleteError(null);
                  setPendingDelete(null);
                }}
                type="button"
              >
                Скасувати
              </button>
              <button className={adminStyles.dangerButton} disabled={isDeleting} onClick={deleteEmployee} type="button">
                {isDeleting ? "Видалення..." : "Так, видалити"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
