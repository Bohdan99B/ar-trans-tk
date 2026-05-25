CREATE TYPE "RequestType" AS ENUM ('CONSULTATION', 'ORDER', 'FAQ');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN');
CREATE TYPE "VacancyStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "TransportRequest"
  ADD COLUMN "type" "RequestType" NOT NULL DEFAULT 'ORDER',
  ALTER COLUMN "origin" DROP NOT NULL,
  ALTER COLUMN "destination" DROP NOT NULL,
  ALTER COLUMN "cargoType" DROP NOT NULL,
  ALTER COLUMN "temperatureMode" DROP NOT NULL,
  ALTER COLUMN "weight" DROP NOT NULL;

ALTER TABLE "Vehicle" ADD COLUMN "description" TEXT;

ALTER TABLE "Review"
  ADD COLUMN "moderationStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  ALTER COLUMN "isPublished" SET DEFAULT false;

UPDATE "Review"
SET "moderationStatus" = CASE WHEN "isPublished" THEN 'PUBLISHED'::"ReviewStatus" ELSE 'HIDDEN'::"ReviewStatus" END;

ALTER TABLE "Vacancy"
  ADD COLUMN "requirements" TEXT,
  ADD COLUMN "salary" TEXT,
  ADD COLUMN "status" "VacancyStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "Vacancy"
SET "status" = CASE WHEN "isPublished" THEN 'ACTIVE'::"VacancyStatus" ELSE 'ARCHIVED'::"VacancyStatus" END;

CREATE TABLE "VacancyApplication" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "comment" TEXT,
    "cvUrl" TEXT,
    "cvPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VacancyApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VacancyApplication_vacancyId_idx" ON "VacancyApplication"("vacancyId");

ALTER TABLE "VacancyApplication" ADD CONSTRAINT "VacancyApplication_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
