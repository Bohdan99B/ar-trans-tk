import { type ReactNode } from "react";

import { AdminCreateAccordion } from "../AdminCreateAccordion";

export function CreateVehicleAccordion({ children }: { children: ReactNode }) {
  return (
    <AdminCreateAccordion title="Добавити новий транспорт">
      {children}
    </AdminCreateAccordion>
  );
}
