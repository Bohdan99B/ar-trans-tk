import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ConfirmSubmitButton, SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { deleteReview, saveReview } from "../actions";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

const statusLabels = { HIDDEN: "Приховано", PENDING: "Очікує", PUBLISHED: "Опубліковано" };

export default async function AdminReviewsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!(await requireAdmin())) redirect(`/${locale}/admin`);
  const query = await searchParams;
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><div><h2>Відгуки</h2><p className={styles.muted}>Модерація відгуків клієнтів.</p></div></div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}
      <form action={saveReview} className={styles.form}>
        <h2>Додати відгук</h2>
        <input name="locale" type="hidden" value={locale} />
        <ReviewFields />
        <SubmitButton>Зберегти відгук</SubmitButton>
      </form>
      {reviews.length === 0 ? <p className={styles.empty}>Відгуків ще немає.</p> : (
        <div className={styles.cards}>
          {reviews.map((review) => (
            <form action={saveReview} className={styles.form} key={review.id}>
              <h2>{review.author}</h2>
              <p className={styles.muted}>{review.createdAt.toLocaleDateString("uk-UA")} · {statusLabels[review.moderationStatus]}</p>
              <input name="id" type="hidden" value={review.id} />
              <input name="locale" type="hidden" value={locale} />
              <ReviewFields review={review} />
              <div className={styles.actions}>
                <SubmitButton>Оновити</SubmitButton>
                <ConfirmSubmitButton action={deleteReview} message="Видалити цей відгук?">Видалити</ConfirmSubmitButton>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

type ReviewValue = { author: string; body: string; company: string | null; moderationStatus: "PENDING" | "PUBLISHED" | "HIDDEN" };

function ReviewFields({ review }: { review?: ReviewValue }) {
  return (
    <div className={styles.fields}>
      <label>Імʼя клієнта<input defaultValue={review?.author} name="author" required /></label>
      <label>Компанія<input defaultValue={review?.company ?? ""} name="company" /></label>
      <label>Текст відгуку<textarea defaultValue={review?.body} name="body" required /></label>
      <label>Статус
        <select defaultValue={review?.moderationStatus ?? "PENDING"} name="moderationStatus">
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}
