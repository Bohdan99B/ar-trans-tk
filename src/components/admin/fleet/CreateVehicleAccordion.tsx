import { type ReactNode } from "react";

import { AdminCreateAccordion } from "@/components/admin/AdminCreateAccordion";

export function CreateVehicleAccordion({ children }: { children: ReactNode }) {
  return (
    <AdminCreateAccordion title="Додати новий транспорт">
      {children}
    </AdminCreateAccordion>
  );
}
