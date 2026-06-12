import { type ReactNode } from "react";

import { AdminCreateAccordion } from "../AdminCreateAccordion";

export function CreateVehicleAccordion({ children }: { children: ReactNode }) {
  return (
    <AdminCreateAccordion title="Додати новий транспорт">
      {children}
    </AdminCreateAccordion>
  );
}
