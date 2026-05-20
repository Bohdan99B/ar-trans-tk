import { prisma } from "@/lib/prisma";

import styles from "../Site.module.css";

export default async function AdminPage() {
  const [requests, vehicles, posts, vacancies] = await Promise.all([
    prisma.transportRequest.count(),
    prisma.vehicle.count(),
    prisma.blogPost.count(),
    prisma.vacancy.count(),
  ]);

  return (
    <div className={styles.grid}>
      {[
        ["Заявки", requests],
        ["Автопарк", vehicles],
        ["Блог", posts],
        ["Вакансії", vacancies],
      ].map(([label, value]) => (
        <article className={styles.card} key={label}>
          <h2>{label}</h2>
          <p>{value}</p>
        </article>
      ))}
    </div>
  );
}
