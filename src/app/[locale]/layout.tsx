import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "seo." } } });
  const value = Object.fromEntries(rows.map((item) => [item.key, item.value]));

  return {
    description: value["seo.description"] || undefined,
    openGraph: {
      description: value["seo.ogDescription"] || value["seo.description"] || undefined,
      images: value["seo.ogImage"] ? [value["seo.ogImage"]] : undefined,
      title: value["seo.ogTitle"] || value["seo.title"] || undefined,
    },
    title: value["seo.title"] || undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
