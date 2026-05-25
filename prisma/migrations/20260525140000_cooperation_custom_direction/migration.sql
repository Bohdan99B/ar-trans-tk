ALTER TABLE "CooperationApplication"
  RENAME COLUMN "direction" TO "customDirection";

ALTER TABLE "CooperationApplication"
  ALTER COLUMN "customDirection" DROP NOT NULL;
