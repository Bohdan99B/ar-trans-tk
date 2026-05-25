CREATE TYPE "CooperationApplicationStatus" AS ENUM ('NEW', 'CONTACTED', 'ARCHIVED');

CREATE TABLE "CooperationApplication" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT,
    "direction" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "comment" TEXT,
    "status" "CooperationApplicationStatus" NOT NULL DEFAULT 'NEW',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperationApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CooperationApplication_vacancyId_idx" ON "CooperationApplication"("vacancyId");
CREATE INDEX "CooperationApplication_status_createdAt_idx" ON "CooperationApplication"("status", "createdAt");

ALTER TABLE "CooperationApplication" ADD CONSTRAINT "CooperationApplication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
