CREATE TYPE "PasswordResetRequestStatus" AS ENUM ('NEW', 'VIEWED', 'COMPLETED', 'EXPIRED', 'FAILED');
CREATE TYPE "PasswordResetEventType" AS ENUM ('CREATED', 'VIEWED', 'RESET_LINK_CREATED', 'EMAIL_SENT', 'EMAIL_FAILED', 'COMPLETED', 'EXPIRED');

CREATE TABLE "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'uk',
    "status" "PasswordResetRequestStatus" NOT NULL DEFAULT 'NEW',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "handledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "handledById" TEXT,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "PasswordResetEventType" NOT NULL,
    "actorId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeInvitation" ADD COLUMN "passwordResetRequestId" TEXT;
ALTER TABLE "PasswordResetToken" ADD COLUMN "requestId" TEXT;

-- Preserve tokens created by the original password recovery migration.
INSERT INTO "PasswordResetRequest" (
    "id",
    "userId",
    "email",
    "role",
    "locale",
    "status",
    "expiresAt",
    "createdAt",
    "updatedAt"
)
SELECT
    'legacy_' || md5(token."id"),
    token."userId",
    app_user."email",
    app_user."role",
    'uk',
    CASE
        WHEN token."expiresAt" <= CURRENT_TIMESTAMP THEN 'EXPIRED'::"PasswordResetRequestStatus"
        ELSE 'NEW'::"PasswordResetRequestStatus"
    END,
    token."expiresAt",
    token."createdAt",
    CURRENT_TIMESTAMP
FROM "PasswordResetToken" AS token
JOIN "User" AS app_user ON app_user."id" = token."userId";

UPDATE "PasswordResetToken"
SET "requestId" = 'legacy_' || md5("id");

ALTER TABLE "PasswordResetToken" ALTER COLUMN "requestId" SET NOT NULL;

CREATE UNIQUE INDEX "EmployeeInvitation_passwordResetRequestId_key" ON "EmployeeInvitation"("passwordResetRequestId");
CREATE INDEX "PasswordResetRequest_status_createdAt_idx" ON "PasswordResetRequest"("status", "createdAt");
CREATE INDEX "PasswordResetRequest_userId_createdAt_idx" ON "PasswordResetRequest"("userId", "createdAt");
CREATE INDEX "PasswordResetRequest_handledById_idx" ON "PasswordResetRequest"("handledById");
CREATE UNIQUE INDEX "PasswordResetToken_requestId_key" ON "PasswordResetToken"("requestId");
CREATE INDEX "PasswordResetEvent_requestId_createdAt_idx" ON "PasswordResetEvent"("requestId", "createdAt");
CREATE INDEX "PasswordResetEvent_actorId_idx" ON "PasswordResetEvent"("actorId");

ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_handledById_fkey"
FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "PasswordResetRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_passwordResetRequestId_fkey"
FOREIGN KEY ("passwordResetRequestId") REFERENCES "PasswordResetRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PasswordResetEvent" ADD CONSTRAINT "PasswordResetEvent_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "PasswordResetRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetEvent" ADD CONSTRAINT "PasswordResetEvent_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User" DROP COLUMN "passwordResetRequestedAt";
