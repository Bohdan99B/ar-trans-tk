import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth";
import { isAdminRole } from "@/lib/owner-account";
import { prisma } from "@/lib/prisma";

import { VacanciesPanel } from "./VacanciesPanel";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    candidatePage?: string;
    create?: string;
    editVacancyId?: string;
    error?: string;
    generalPage?: string;
    selectedVacancyId?: string;
    success?: string;
    vacancyPage?: string;
  }>;
};

const PAGE_SIZE = 6;

function getPage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminVacanciesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const user = await requireStaff();
  if (!user) redirect(`/${locale}`);
  const query = await searchParams;
  const [vacancyTotal, generalTotal] = await Promise.all([
    prisma.vacancy.count(),
    prisma.cooperationApplication.count({ where: { vacancyId: null } }),
  ]);
  const vacancyPageCount = Math.max(1, Math.ceil(vacancyTotal / PAGE_SIZE));
  const vacancyPage = Math.min(getPage(query.vacancyPage), vacancyPageCount);
  const generalPageCount = Math.max(1, Math.ceil(generalTotal / PAGE_SIZE));
  const generalPage = Math.min(getPage(query.generalPage), generalPageCount);
  const vacancies = await prisma.vacancy.findMany({
    include: {
      _count: { select: { applications: true, cooperationApplications: true } },
      applications: {
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
      },
      cooperationApplications: {
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (vacancyPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const selectedVacancyId = vacancies.some((vacancy) => vacancy.id === query.selectedVacancyId)
    ? query.selectedVacancyId
    : undefined;
  const selectedVacancy = vacancies.find((vacancy) => vacancy.id === selectedVacancyId);
  const candidatePageCount = selectedVacancy
    ? Math.max(
        1,
        Math.ceil(Math.max(selectedVacancy._count.applications, selectedVacancy._count.cooperationApplications) / PAGE_SIZE),
      )
    : 1;
  const candidatePage = Math.min(getPage(query.candidatePage), candidatePageCount);
  if (selectedVacancy && candidatePage > 1) {
    const [applications, cooperationApplications] = await Promise.all([
      prisma.vacancyApplication.findMany({
        orderBy: { createdAt: "desc" },
        skip: (candidatePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        where: { vacancyId: selectedVacancy.id },
      }),
      prisma.cooperationApplication.findMany({
        orderBy: { createdAt: "desc" },
        skip: (candidatePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        where: { vacancyId: selectedVacancy.id },
      }),
    ]);
    selectedVacancy.applications = applications;
    selectedVacancy.cooperationApplications = cooperationApplications;
  }
  const generalApplications = await prisma.cooperationApplication.findMany({
    orderBy: { createdAt: "desc" },
    skip: (generalPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    where: { vacancyId: null },
  });

  return (
    <VacanciesPanel
      candidatePage={candidatePage}
      candidatePageCount={candidatePageCount}
      canManage={isAdminRole(user.role)}
      generalApplications={generalApplications.map((application) => ({
        ...application,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
      }))}
      generalPage={generalPage}
      generalPageCount={generalPageCount}
      initialCreateOpen={query.create === "open"}
      initialEditVacancyId={query.editVacancyId}
      initialVacancyId={selectedVacancyId}
      locale={locale}
      message={{ error: query.error, success: query.success }}
      vacancies={vacancies.map((vacancy) => ({
        ...vacancy,
        applications: vacancy.applications.map((application) => ({
          ...application,
          createdAt: application.createdAt.toISOString(),
        })),
        cooperationApplications: vacancy.cooperationApplications.map((application) => ({
          ...application,
          createdAt: application.createdAt.toISOString(),
          updatedAt: application.updatedAt.toISOString(),
        })),
        createdAt: vacancy.createdAt.toISOString(),
        updatedAt: vacancy.updatedAt.toISOString(),
      }))}
      vacancyPage={vacancyPage}
      vacancyPageCount={vacancyPageCount}
    />
  );
}
