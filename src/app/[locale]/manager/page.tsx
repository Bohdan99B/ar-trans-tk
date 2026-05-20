import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@/lib/auth";

import styles from "../Site.module.css";

type ManagerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ManagerPage({ params }: ManagerPageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/${locale}/manager`);
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    redirect(`/${locale}`);
  }

  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>Панель співробітника</p>
      <h1 className={styles.heading}>Вітаємо, {user.name ?? user.email}</h1>
      <p className={styles.lead}>
        Тут буде робочий простір менеджера без доступу до створення або видалення адміністраторів.
      </p>
      <div className={styles.grid}>
        <Link className={styles.card} href={`/${locale}/status`}>
          <h2>Статус заявки</h2>
          <p>Перевірити стан перевезення за номером заявки.</p>
        </Link>
        <Link className={styles.card} href={`/${locale}/contacts`}>
          <h2>Контакти</h2>
          <p>Швидкий доступ до контактів компанії.</p>
        </Link>
      </div>
    </section>
  );
}
