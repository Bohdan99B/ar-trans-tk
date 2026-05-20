CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MANAGER';

CREATE TABLE "EmployeeInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MANAGER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeInvitation_tokenHash_key" ON "EmployeeInvitation"("tokenHash");
CREATE INDEX "EmployeeInvitation_email_idx" ON "EmployeeInvitation"("email");
CREATE INDEX "EmployeeInvitation_userId_idx" ON "EmployeeInvitation"("userId");
CREATE INDEX "EmployeeInvitation_createdById_idx" ON "EmployeeInvitation"("createdById");

ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
