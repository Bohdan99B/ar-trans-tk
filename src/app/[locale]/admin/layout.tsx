import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@/lib/auth";

import styles from "../Site.module.css";
import { AdminNav } from "./AdminNav";

const staffLinks = [["requests", "Заявки та питання"]];

const adminLinks = [
  ...staffLinks,
  ["fleet", "Автопарк"],
  ["employees", "Співробітники"],
  ["reviews", "Відгуки"],
  ["vacancies", "Вакансії"],
  // TODO: Restore when the site content management section is ready.
  // ["content", "Контент сайту"],
  ["settings", "Налаштування"],
];

const managerLinks = [
  ["", "Dashboard"],
  ...staffLinks,
  ["fleet", "Автопарк"],
  ["vacancies", "Вакансії"],
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
  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    redirect(`/${locale}`);
  }
  const links = (user.role === "ADMIN" ? [["", "Dashboard"], ...adminLinks] : managerLinks).map(
    ([href, label]) => ({ href: `/${locale}/admin${href ? `/${href}` : ""}`, label }),
  );

  return (
    <section className={styles.adminShell}>
      <p className={styles.eyebrow}>Адмінка</p>
      <h1 className={styles.heading}>AR Trans TK CMS</h1>
      <AdminNav links={links} />
      {children}
    </section>
  );
}
