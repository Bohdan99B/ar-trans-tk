import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@/lib/auth";

import styles from "../Site.module.css";

const adminLinks = [
  ["requests", "Заявки"],
  ["statuses", "Статуси"],
  ["employees", "Співробітники"],
  ["managers", "Менеджери"],
  ["services", "Послуги"],
  ["fleet", "Автопарк"],
  ["geography", "Напрямки"],
  ["reviews", "Відгуки"],
  ["blog", "Блог"],
  ["vacancies", "Вакансії"],
  ["faq", "FAQ"],
  ["settings", "Налаштування"],
];

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/${locale}/admin`);
  }

  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  return (
    <section className={styles.adminShell}>
      <p className={styles.eyebrow}>Адмінка</p>
      <h1 className={styles.heading}>AR Trans TK CMS</h1>
      <nav className={styles.adminNav} aria-label="Admin navigation">
        <Link href={`/${locale}/admin`}>Dashboard</Link>
        {adminLinks.map(([href, label]) => (
          <Link href={`/${locale}/admin/${href}`} key={href}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </section>
  );
}
