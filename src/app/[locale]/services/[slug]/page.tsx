import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { prisma } from "@/lib/prisma";

import styles from "../../Site.module.css";

type ServicePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

async function findService(slug: string) {
  return prisma.service.findFirst({ where: { isPublished: true, slug } });
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await findService(slug);

  if (!service) return {};

  return {
    description: locale === "en" ? service.summaryEn : service.summaryUk,
    title: locale === "en" ? service.titleEn : service.titleUk,
  };
}

export default async function ManagedServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params;
  const service = await findService(slug);

  if (!service) notFound();

  const title = locale === "en" ? service.titleEn : service.titleUk;
  const summary = locale === "en" ? service.summaryEn : service.summaryUk;
  const body = locale === "en" ? service.bodyEn : service.bodyUk;

  return (
    <>
      <PageHero eyebrow={locale === "en" ? "Services" : "Послуги"} text={summary} title={title} />
      <section className={styles.sectionAlt}>
        <div className={`${styles.container} ${styles.richText}`}>
          {body.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
    </>
  );
}
