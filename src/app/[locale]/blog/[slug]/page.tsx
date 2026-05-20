import { PageHero } from "@/components/sections/PageHero";

import styles from "../../Site.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <>
      <PageHero
        eyebrow="Блог"
        text="Матеріал підготовлений як базовий контент для майбутнього наповнення через адмінку."
        title={slug === "cold-chain-checklist" ? "Чекліст для температурного вантажу" : "Маршрути Україна - ЄС"}
      />
      <section className={styles.sectionAlt}>
        <article className={`${styles.container} ${styles.card}`}>
          <p>
            Перед рейсом варто зафіксувати тип вантажу, температуру, вагу, адресу завантаження,
            часові вікна, контакт відповідальної особи та вимоги до документів.
          </p>
        </article>
      </section>
    </>
  );
}
