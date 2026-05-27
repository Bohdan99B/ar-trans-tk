import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { EmployeeAdminPanel } from "./EmployeeAdminPanel";

type AdminEmployeesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEmployeesPage({ params }: AdminEmployeesPageProps) {
  const { locale } = await params;
  if (!(await requireAdmin())) redirect(`/${locale}/admin`);
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
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section>
      <EmployeeAdminPanel
        employees={employees.map((employee) => ({
          createdAt: employee.createdAt.toISOString(),
          email: employee.email,
          id: employee.id,
          invitations: employee.employeeInvitations.map((invite) => ({
            expiresAt: invite.expiresAt.toISOString(),
            id: invite.id,
            status: invite.status,
          })),
          name: employee.name,
          role: employee.role,
        }))}
        locale={locale}
      />
    </section>
  );
}
