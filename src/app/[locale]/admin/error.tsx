"use client";

import styles from "@/components/admin/Admin.module.css";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className={styles.error}>
      <p>Не вдалося завантажити дані адмін-панелі.</p>
      <button className={styles.primaryButton} onClick={() => reset()} type="button">Спробувати знову</button>
    </div>
  );
}
