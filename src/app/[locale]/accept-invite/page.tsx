import styles from "./AcceptInvite.module.css";
import { AcceptInviteForm } from "./AcceptInviteForm";

type AcceptInvitePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ params, searchParams }: AcceptInvitePageProps) {
  const { locale } = await params;
  const { token } = await searchParams;

  return (
    <section className={styles.screen}>
      <p>AR Trans TK CMS</p>
      <h1>Запрошення співробітника</h1>
      {token ? (
        <>
          <p>Задайте пароль для робочого акаунта. Після цього ви зможете увійти через сторінку входу співробітника.</p>
          <AcceptInviteForm locale={locale} token={token} />
        </>
      ) : (
        <p>Посилання запрошення некоректне або неповне.</p>
      )}
    </section>
  );
}
