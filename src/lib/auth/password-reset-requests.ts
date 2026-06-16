import type { Prisma } from "@prisma/client";

export function getActionablePasswordResetWhere(): Prisma.PasswordResetRequestWhereInput {
  return {
    expiresAt: { gt: new Date() },
    role: "MANAGER",
    status: { in: ["NEW", "VIEWED"] },
  };
}
