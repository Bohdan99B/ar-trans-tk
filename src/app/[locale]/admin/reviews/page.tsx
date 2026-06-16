import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/AdminControls";
import { AdminCreateAccordion } from "@/components/admin/AdminCreateAccordion";
import styles from "@/components/admin/Admin.module.css";
import { deleteReview, saveReview } from "@/server/actions/admin";
import { AutoResizeTextarea } from "@/components/admin/reviews/AutoResizeTextarea";
import { ReviewsPanel } from "@/components/admin/reviews/ReviewsPanel";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; mode?: string; success?: string }>;
};

const statusOptions = [
  { label: "Очікує", value: "PENDING" },
  { label: "Приховано", value: "HIDDEN" },
  { label: "Опубліковано", value: "PUBLISHED" },
] as const;
const statusLabels = Object.fromEntries(statusOptions.map(({ label, value }) => [value, label])) as Record<ReviewStatus, string>;
type ReviewStatus = typeof statusOptions[number]["value"];

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
      <AdminCreateAccordion
        clearDraft={query.mode === "create" && Boolean(query.success)}
        draftStorageKey={`admin-review-draft:${locale}`}
        initialOpen={query.mode === "create" && Boolean(query.error)}
        key={`${query.mode ?? ""}:${query.error ?? ""}:${query.success ?? ""}`}
        title="Додати відгук"
      >
        <form action={saveReview} className={`${styles.form} ${styles.reviewEditForm}`}>
          <h2>Новий відгук</h2>
          <input name="locale" type="hidden" value={locale} />
          <ReviewFields />
          <SubmitButton>Зберегти відгук</SubmitButton>
        </form>
      </AdminCreateAccordion>
      <ReviewsPanel
        reviews={reviews.map((review) => {
          const date = review.createdAt.toLocaleDateString("uk-UA");
          return {
            author: review.author,
            company: review.company,
            id: review.id,
            moderationStatus: review.moderationStatus,
            searchText: [
              review.author,
              review.company,
              review.body,
              statusLabels[review.moderationStatus],
              date,
            ].filter(Boolean).join(" ").toLocaleLowerCase("uk-UA"),
          };
        })}
      >
        {reviews.map((review) => (
          <form action={saveReview} className={`${styles.form} ${styles.reviewEditForm}`} key={review.id}>
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
      </ReviewsPanel>
    </div>
  );
}

type ReviewValue = { author: string; body: string; company: string | null; moderationStatus: ReviewStatus };

function ReviewFields({ review }: { review?: ReviewValue }) {
  return (
    <div className={styles.fields}>
      <label>Імʼя клієнта<input defaultValue={review?.author} name="author" required /></label>
      <label>Компанія<input defaultValue={review?.company ?? ""} name="company" /></label>
      <label className={styles.reviewBodyField}>
        Текст відгуку
        <AutoResizeTextarea className={styles.reviewTextarea} defaultValue={review?.body} name="body" required rows={3} />
      </label>
      <label>Статус
        <select defaultValue={review?.moderationStatus ?? "PENDING"} name="moderationStatus">
          {statusOptions.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}
