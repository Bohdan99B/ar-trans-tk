import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import styles from "../../Site.module.css";

async function updateStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const statusId = String(formData.get("statusId"));
  await prisma.transportRequest.update({
    data: { statusId },
    where: { id },
  });
  revalidatePath("/[locale]/admin/requests", "page");
}

export default async function AdminRequestsPage() {
  const [requests, statuses] = await Promise.all([
    prisma.transportRequest.findMany({
      include: { status: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.requestStatus.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Номер</th>
            <th>Клієнт</th>
            <th>Маршрут</th>
            <th>Вантаж</th>
            <th>Email</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id}>
              <td>{item.requestNumber}</td>
              <td>
                {item.name}
                <br />
                {item.phone}
              </td>
              <td>
                {item.origin} {"->"} {item.destination}
              </td>
              <td>
                {item.cargoType}
                <br />
                {item.temperatureMode}, {item.weight}
              </td>
              <td>{item.emailSent ? "надіслано" : item.emailError ? "помилка" : "не надсилалось"}</td>
              <td>
                <form action={updateStatus}>
                  <input name="id" type="hidden" value={item.id} />
                  <select defaultValue={item.statusId} name="statusId">
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.titleUk}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Оновити</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
