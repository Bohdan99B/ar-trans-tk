export type EmployeeRole = "OWNER" | "ADMIN" | "MANAGER";

type EmployeeIdentity = {
  id: string;
  role: EmployeeRole;
};

export function canDeleteEmployee(actor: EmployeeIdentity, employee: EmployeeIdentity) {
  if (actor.id === employee.id) {
    return false;
  }

  if (actor.role === "OWNER") {
    return true;
  }

  return actor.role === "ADMIN" && employee.role !== "OWNER";
}
