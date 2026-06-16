import type { UserRole } from "@prisma/client";

export function isOwnerRole(role: UserRole) {
  return role === "OWNER";
}

export function isAdminRole(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}
