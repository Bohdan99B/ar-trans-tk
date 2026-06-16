import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/auth";
import { isOwnerRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

import { EmployeeAdminPanel } from "@/components/admin/employees/EmployeeAdminPanel";
import { PasswordResetRequestsPanel } from "@/components/admin/employees/PasswordResetRequestsPanel";

type AdminEmployeesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEmployeesPage({ params }: AdminEmployeesPageProps) {
  const { locale } = await params;
  const currentUser = await requireAdmin();
  if (!currentUser) redirect(`/${locale}/admin`);
  const t = await getTranslations({ locale, namespace: "passwordResetAdmin" });
  const employees = await prisma.user.findMany({
    include: {
      employeeInvitations: {
        orderBy: { createdAt: "desc" },
        select: {
          expiresAt: true,
          id: true,
          status: true,
        },
        take: 1,
      },
      passwordResetRequests: {
        orderBy: { createdAt: "desc" },
        select: { status: true },
        take: 1,
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section>
      <EmployeeAdminPanel
        currentUser={{ id: currentUser.id, role: currentUser.role }}
        employees={employees.map((employee) => ({
          createdAt: employee.createdAt.toISOString(),
          email: employee.email,
          id: employee.id,
          isOwner: isOwnerRole(employee.role),
          invitations: employee.employeeInvitations.map((invite) => ({
            expiresAt: invite.expiresAt.toISOString(),
            id: invite.id,
            status: invite.status,
          })),
          name: employee.name,
          resetStatus: employee.passwordResetRequests[0]?.status ?? null,
          role: employee.role,
        }))}
        locale={locale}
        resetLabels={{
          accepted: t("employeeAccepted"),
          completed: t("employeeResetCompleted"),
          invitePending: t("employeeInvitePending"),
          requested: t("employeeResetRequested"),
          viewed: t("employeeResetViewed"),
        }}
      />
      <PasswordResetRequestsPanel
        locale={locale}
        messages={{
          actionError: t("actionError"),
          cancel: t("cancel"),
          cancelling: t("cancelling"),
          completedAt: t("completedAt"),
          copied: t("copied"),
          copy: t("copy"),
          copyError: t("copyError"),
          createLink: t("createLink"),
          createdAt: t("createdAt"),
          creatingLink: t("creatingLink"),
          description: t("description"),
          empty: t("empty"),
          expiresAt: t("expiresAt"),
          handledBy: t("handledBy"),
          hideDetails: t("hideDetails"),
          linkError: t("linkError"),
          linkTitle: t("linkTitle"),
          loadError: t("loadError"),
          loading: t("loading"),
          noName: t("noName"),
          notAssigned: t("notAssigned"),
          notYet: t("notYet"),
          notificationError: t("notificationError"),
          paginationLabel: t("paginationLabel"),
          statusCancelled: t("statusCancelled"),
          statusCompleted: t("statusCompleted"),
          statusExpired: t("statusExpired"),
          statusFailed: t("statusFailed"),
          statusNew: t("statusNew"),
          statusViewed: t("statusViewed"),
          technicalDetails: t("technicalDetails"),
          title: t("title"),
          viewMore: t("viewMore"),
          viewedAt: t("viewedAt"),
        }}
      />
    </section>
  );
}
