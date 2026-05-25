import { prisma } from "@/lib/prisma";

export function createRequestNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ART-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function getNewRequestStatus() {
  return prisma.requestStatus.upsert({
    create: {
      code: "new",
      sortOrder: 0,
      titleEn: "New",
      titleUk: "Нова",
    },
    update: {},
    where: { code: "new" },
  });
}

export async function ensureRequestStatuses() {
  await Promise.all([
    getNewRequestStatus(),
    prisma.requestStatus.upsert({
      create: { code: "in_progress", sortOrder: 1, titleEn: "In progress", titleUk: "В роботі" },
      update: { sortOrder: 1, titleUk: "В роботі" },
      where: { code: "in_progress" },
    }),
    prisma.requestStatus.upsert({
      create: { code: "completed", sortOrder: 2, titleEn: "Completed", titleUk: "Завершена" },
      update: { sortOrder: 2, titleUk: "Завершена" },
      where: { code: "completed" },
    }),
  ]);
}
