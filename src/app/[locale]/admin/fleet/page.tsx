import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth";
import { isAdminRole } from "@/lib/owner-account";
import { prisma } from "@/lib/prisma";

import { ConfirmSubmitButton, SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { deleteVehicle, deleteVehiclePhoto, saveVehicle } from "../actions";
import { ImageUploadField } from "../ImageUploadField";
import { CreateVehicleAccordion } from "./CreateVehicleAccordion";
import { FleetCardsPanel } from "./FleetCardsPanel";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminFleetPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const user = await requireStaff();
  if (!user) redirect(`/${locale}`);
  const canManage = isAdminRole(user.role);
  const query = await searchParams;
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h2>Автопарк</h2><p className={styles.muted}>Транспорт, фото та відображення на сайті.</p></div>
      </div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}
      {canManage ? (
        <CreateVehicleAccordion>
          <form action={saveVehicle} className={`${styles.form} ${styles.vehicleEditForm}`}>
            <input name="locale" type="hidden" value={locale} />
            <VehicleFields canManage />
            <SubmitButton>Створити транспорт</SubmitButton>
          </form>
        </CreateVehicleAccordion>
      ) : null}
      {vehicles.length === 0 ? <p className={styles.empty}>Транспорт ще не додано.</p> : (
        <FleetCardsPanel vehicles={vehicles.map((vehicle) => ({ id: vehicle.id, title: vehicle.title }))}>
          {vehicles.map((vehicle) => (
            <form action={saveVehicle} className={`${styles.form} ${styles.vehicleEditForm}`} key={vehicle.id}>
              <input name="id" type="hidden" value={vehicle.id} />
              <input name="locale" type="hidden" value={locale} />
              <VehicleFields canManage={canManage} vehicle={vehicle} />
              <div className={styles.actions}>
                <SubmitButton>{canManage ? "Зберегти" : "Оновити доступність"}</SubmitButton>
                {canManage ? <ConfirmSubmitButton action={deleteVehicle} message="Видалити транспорт із автопарку?">Видалити</ConfirmSubmitButton> : null}
              </div>
            </form>
          ))}
        </FleetCardsPanel>
      )}
    </div>
  );
}

type VehicleValue = {
  brand: string | null;
  description: string | null;
  photoUrl: string | null;
  isActive: boolean;
  payloadTonnes: { toString(): string };
  temperatureFrom: number;
  temperatureTo: number;
  title: string;
  volume: string | null;
};

function VehicleFields({ canManage, vehicle }: { canManage: boolean; vehicle?: VehicleValue }) {
  return (
    <div className={`${styles.fields} ${styles.vehicleFields}`}>
      <label>Реєстраційний номер<input defaultValue={vehicle?.title} disabled={!canManage} name="title" placeholder="Реєстраційний номер" required /></label>
      <label>Марка<input defaultValue={vehicle?.brand ?? ""} disabled={!canManage} name="brand" /></label>
      <label>Короткий опис<textarea defaultValue={vehicle?.description ?? ""} name="description" /></label>
      <label>Вантажопідйомність, т<input defaultValue={vehicle?.payloadTonnes.toString() ?? "20"} disabled={!canManage} min="0.01" name="payloadTonnes" required step="0.01" type="number" /></label>
      <label>Температура від<input defaultValue={vehicle?.temperatureFrom ?? -20} disabled={!canManage} name="temperatureFrom" required type="number" /></label>
      <label>Температура до<input defaultValue={vehicle?.temperatureTo ?? 20} disabled={!canManage} name="temperatureTo" required type="number" /></label>
      <label className={styles.compactField}>Обʼєм<input className={styles.compactInput} defaultValue={vehicle?.volume ?? ""} disabled={!canManage} name="volume" /></label>
      {canManage ? (
        <ImageUploadField
          currentAlt={vehicle?.title}
          currentImageUrl={vehicle?.photoUrl}
          deleteAction={vehicle?.photoUrl ? deleteVehiclePhoto : undefined}
          deleteConfirmMessage="Видалити фото транспорту з Cloudinary?"
          helperText="Рекомендований формат фото: горизонтальне зображення 16:9."
          inputName="photo"
          label="Фото"
        />
      ) : null}
      <label className={styles.checkbox}><input defaultChecked={vehicle?.isActive ?? true} name="isActive" type="checkbox" /> Активний на сайті</label>
    </div>
  );
}
