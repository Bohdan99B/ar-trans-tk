import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";

import styles from "../Site.module.css";

const posts = [
  {
    slug: "cold-chain-checklist",
    title: "Чекліст для температурного вантажу",
    text: "Що підготувати перед заявкою на рефрижераторне перевезення.",
  },
  {
    slug: "eu-refrigerated-routes",
    title: "Маршрути Україна - ЄС",
    text: "Особливості експорту та імпорту температурних вантажів.",
  },
];

type BlogPageProps = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  return (
    <>
      <PageHero
        eyebrow="Блог"
        text="Практичні матеріали про рефрижераторні перевезення, документи, маршрути та підготовку вантажу."
        title="Блог"
      />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.grid}`}>
          {posts.map((post) => (
            <Link className={styles.card} href={`/${locale}/blog/${post.slug}`} key={post.slug}>
              <h2>{post.title}</h2>
              <p>{post.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
