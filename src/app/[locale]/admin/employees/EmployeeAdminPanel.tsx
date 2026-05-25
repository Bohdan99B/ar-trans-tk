"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./Employees.module.css";

type Employee = {
  createdAt: string;
  email: string;
  id: string;
  invitations: {
    expiresAt: string;
    id: string;
    status: string;
  }[];
  name: string | null;
  role: "ADMIN" | "MANAGER";
};

type EmployeeAdminPanelProps = {
  employees: Employee[];
  locale: string;
};

type Message = {
  tone: "error" | "success";
  text: string;
};

const roleLabels = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
};

export function EmployeeAdminPanel({ employees, locale }: EmployeeAdminPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState<string | null>(null);

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
    const response = await fetch(`/api/admin/employees/${pendingDelete.id}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    setIsDeleting(false);

    if (!response.ok) {
      setMessage({ tone: "error", text: payload?.error ?? "Не вдалося видалити співробітника" });
      return;
    }

    setPendingDelete(null);
    setMessage({ tone: "success", text: "Співробітника видалено" });
    router.refresh();
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
      setMessage({ tone: "error", text: payload?.error ?? "Не вдалося створити reset-посилання" });
      return;
    }
    setInviteUrl(payload.inviteUrl);
    setMessage({ tone: "success", text: "Посилання для нового пароля створено" });
    router.refresh();
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
          Email
          <input name="email" required type="email" />
        </label>
        <label>
          Роль
          <select defaultValue="MANAGER" name="role">
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <button className={styles.primaryButton} disabled={isCreating} type="submit">
          {isCreating ? "Створення..." : "Створити запрошення"}
        </button>
      </form>

      {message ? <p className={message.tone === "error" ? styles.error : styles.success}>{message.text}</p> : null}
      {inviteUrl ? (
        <div className={styles.inviteBox}>
          <span>Одноразове посилання для встановлення пароля:</span>
          <a href={inviteUrl}>{inviteUrl}</a>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ім&apos;я</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Запрошення</th>
              <th>Дія</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const latestInvite = employee.invitations[0];
              return (
                <tr key={employee.id}>
                  <td>{employee.name ?? "Без імені"}</td>
                  <td>{employee.email}</td>
                  <td>{roleLabels[employee.role]}</td>
                  <td>{latestInvite ? latestInvite.status : "Пароль вже задано або invite відсутній"}</td>
                  <td>
                    <button className={styles.secondaryButton} disabled={isResetting === employee.id} onClick={() => resetPassword(employee)} type="button">
                      {isResetting === employee.id ? "Створення..." : "Reset password"}
                    </button>{" "}
                    <button className={styles.dangerButton} onClick={() => setPendingDelete(employee)} type="button">
                      Видалити
                    </button>
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
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} disabled={isDeleting} onClick={() => setPendingDelete(null)} type="button">
                Скасувати
              </button>
              <button className={styles.dangerButton} disabled={isDeleting} onClick={deleteEmployee} type="button">
                {isDeleting ? "Видалення..." : "Так, видалити"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
