import Image from "next/image";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ConfirmSubmitButton, SubmitButton } from "../AdminControls";
import styles from "../Admin.module.css";
import { deleteVehicle, saveVehicle } from "../actions";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminFleetPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const user = await requireStaff();
  if (!user) redirect(`/${locale}`);
  const canManage = user.role === "ADMIN";
  const query = await searchParams;
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h2>Автопарк</h2><p className={styles.muted}>Транспорт, фото та відображення на сайті.</p></div>
      </div>
      {query.success ? <p className={styles.success}>{query.success}</p> : null}
      {query.error ? <p className={styles.error}>{query.error}</p> : null}
      {canManage ? <form action={saveVehicle} className={styles.form}>
        <h2>Новий транспорт</h2>
        <input name="locale" type="hidden" value={locale} />
        <VehicleFields canManage />
        <SubmitButton>Створити транспорт</SubmitButton>
      </form> : null}
      {vehicles.length === 0 ? <p className={styles.empty}>Транспорт ще не додано.</p> : (
        <div className={styles.cards}>
          {vehicles.map((vehicle) => (
            <form action={saveVehicle} className={styles.form} key={vehicle.id}>
              <h2>{vehicle.title}</h2>
              {vehicle.photoUrl ? <Image alt={vehicle.title} height={160} src={vehicle.photoUrl} width={260} /> : null}
              <input name="id" type="hidden" value={vehicle.id} />
              <input name="locale" type="hidden" value={locale} />
              <VehicleFields canManage={canManage} vehicle={vehicle} />
              <div className={styles.actions}>
                <SubmitButton>{canManage ? "Зберегти" : "Оновити доступність"}</SubmitButton>
                {canManage ? <ConfirmSubmitButton action={deleteVehicle} message="Видалити транспорт із автопарку?">Видалити</ConfirmSubmitButton> : null}
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

type VehicleValue = {
  brand: string | null;
  description: string | null;
  isActive: boolean;
  payloadTonnes: { toString(): string };
  temperatureFrom: number;
  temperatureTo: number;
  title: string;
  volume: string | null;
};

function VehicleFields({ canManage, vehicle }: { canManage: boolean; vehicle?: VehicleValue }) {
  return (
    <div className={styles.fields}>
      <label>Назва<input defaultValue={vehicle?.title} disabled={!canManage} name="title" required /></label>
      <label>Марка<input defaultValue={vehicle?.brand ?? ""} disabled={!canManage} name="brand" /></label>
      <label>Короткий опис<textarea defaultValue={vehicle?.description ?? ""} name="description" /></label>
      <label>Вантажопідйомність, т<input defaultValue={vehicle?.payloadTonnes.toString() ?? "20"} disabled={!canManage} min="0.01" name="payloadTonnes" required step="0.01" type="number" /></label>
      <label>Температура від<input defaultValue={vehicle?.temperatureFrom ?? -20} disabled={!canManage} name="temperatureFrom" required type="number" /></label>
      <label>Температура до<input defaultValue={vehicle?.temperatureTo ?? 20} disabled={!canManage} name="temperatureTo" required type="number" /></label>
      <label>Обʼєм<input defaultValue={vehicle?.volume ?? ""} disabled={!canManage} name="volume" /></label>
      {canManage ? <label>Фото<input accept="image/*" name="photo" type="file" /></label> : null}
      <label className={styles.checkbox}><input defaultChecked={vehicle?.isActive ?? true} name="isActive" type="checkbox" /> Активний на сайті</label>
    </div>
  );
}
