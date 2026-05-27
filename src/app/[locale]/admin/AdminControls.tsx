"use client";

import { useFormStatus } from "react-dom";

import styles from "./Admin.module.css";

type SubmitButtonProps = {
  children: React.ReactNode;
  danger?: boolean;
  pendingLabel?: string;
};

export function SubmitButton({ children, danger = false, pendingLabel = "Збереження..." }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={danger ? styles.dangerButton : styles.primaryButton} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ConfirmSubmitButton({
  action,
  children,
  message,
}: {
  action: (data: FormData) => void | Promise<void>;
  children: React.ReactNode;
  message: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={styles.dangerButton}
      data-skip-validation="true"
      disabled={pending}
      formAction={action}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {pending ? "Видалення..." : children}
    </button>
  );
}
