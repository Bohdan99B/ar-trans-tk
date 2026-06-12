import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const action = process.argv[2];
const emailSchema = z.string().trim().email().toLowerCase();
const passwordSchema = z.string().min(10);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message.includes('invalid input value for enum "UserRole": "OWNER"')) {
    return "The database does not have the OWNER role. Run `npx prisma migrate deploy` first.";
  }
  return error instanceof Error ? error.message : "Owner operation failed.";
}

async function createOwner(prisma) {
  const email = emailSchema.parse(requireEnv("OWNER_EMAIL"));
  const password = passwordSchema.parse(requireEnv("OWNER_PASSWORD"));
  const name = process.env.OWNER_NAME?.trim() || null;
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('ar-trans-tk:owner'))`;

    const existingOwner = await transaction.user.findFirst({
      select: { email: true },
      where: { role: "OWNER" },
    });
    if (existingOwner) {
      return { email: existingOwner.email, status: "owner-exists" };
    }

    const existingUser = await transaction.user.findUnique({
      select: { role: true },
      where: { email },
    });
    if (existingUser) {
      return { role: existingUser.role, status: "email-exists" };
    }

    await transaction.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "OWNER",
      },
    });

    return { status: "created" };
  });

  if (result.status === "owner-exists") {
    throw new Error(`An OWNER already exists (${result.email}). No changes were made.`);
  }
  if (result.status === "email-exists") {
    throw new Error(`A ${result.role} user already uses ${email}. No changes were made.`);
  }

  console.log(`OWNER created successfully: ${email}`);
}

async function checkOwner(prisma) {
  const owners = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true, id: true, name: true },
    where: { role: "OWNER" },
  });

  if (owners.length === 0) {
    throw new Error("No OWNER exists.");
  }
  if (owners.length > 1) {
    throw new Error(`Expected one OWNER, found ${owners.length}. Investigate before making changes.`);
  }

  console.log(`OWNER verified: ${owners[0].email} (${owners[0].name ?? "no name"}, id: ${owners[0].id})`);
}

async function promoteAdmin(prisma) {
  const email = emailSchema.parse(requireEnv("OWNER_EMAIL"));

  const result = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('ar-trans-tk:owner'))`;

    const existingOwner = await transaction.user.findFirst({
      select: { email: true },
      where: { role: "OWNER" },
    });
    if (existingOwner) {
      return { email: existingOwner.email, status: "owner-exists" };
    }

    const user = await transaction.user.findUnique({
      select: { id: true, passwordHash: true, role: true },
      where: { email },
    });
    if (!user) {
      return { status: "user-missing" };
    }
    if (user.role !== "ADMIN") {
      return { role: user.role, status: "invalid-role" };
    }
    if (!user.passwordHash) {
      return { status: "password-missing" };
    }

    await transaction.user.update({
      data: { role: "OWNER" },
      where: { id: user.id },
    });
    return { status: "promoted" };
  });

  if (result.status === "owner-exists") {
    throw new Error(`An OWNER already exists (${result.email}). No changes were made.`);
  }
  if (result.status === "user-missing") {
    throw new Error(`No user exists with email ${email}. No changes were made.`);
  }
  if (result.status === "invalid-role") {
    throw new Error(`Only an existing ADMIN can be promoted; ${email} is ${result.role}. No changes were made.`);
  }
  if (result.status === "password-missing") {
    throw new Error(`The ADMIN ${email} has no password. Complete account setup before promotion.`);
  }

  console.log(`ADMIN promoted to OWNER successfully: ${email}`);
}

async function updateOwnerEmail(prisma) {
  const currentEmail = emailSchema.parse(requireEnv("OWNER_EMAIL"));
  const newEmail = emailSchema.parse(requireEnv("OWNER_NEW_EMAIL"));

  if (currentEmail === newEmail) {
    throw new Error("OWNER_EMAIL and OWNER_NEW_EMAIL must be different.");
  }

  const result = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('ar-trans-tk:owner'))`;

    const owners = await transaction.user.findMany({
      select: { email: true, id: true },
      where: { role: "OWNER" },
    });
    if (owners.length !== 1) {
      return { count: owners.length, status: "invalid-owner-count" };
    }
    if (owners[0].email !== currentEmail) {
      return { actualEmail: owners[0].email, status: "current-email-mismatch" };
    }

    const conflictingUser = await transaction.user.findUnique({
      select: { role: true },
      where: { email: newEmail },
    });
    if (conflictingUser) {
      return { role: conflictingUser.role, status: "email-exists" };
    }

    await transaction.user.update({
      data: { email: newEmail },
      where: { id: owners[0].id },
    });
    return { status: "updated" };
  });

  if (result.status === "invalid-owner-count") {
    throw new Error(`Expected exactly one OWNER, found ${result.count}. No changes were made.`);
  }
  if (result.status === "current-email-mismatch") {
    throw new Error(`OWNER_EMAIL does not match the current OWNER (${result.actualEmail}). No changes were made.`);
  }
  if (result.status === "email-exists") {
    throw new Error(`A ${result.role} user already uses ${newEmail}. No changes were made.`);
  }

  console.log(`OWNER email updated successfully: ${currentEmail} -> ${newEmail}`);
}

if (!["check", "create", "promote", "update-email"].includes(action)) {
  fail("Use an owner:* npm command defined in package.json.");
} else {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    fail("DATABASE_URL is required. The script has no fallback database.");
  } else {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

    try {
      if (action === "check") await checkOwner(prisma);
      if (action === "create") await createOwner(prisma);
      if (action === "promote") await promoteAdmin(prisma);
      if (action === "update-email") await updateOwnerEmail(prisma);
    } catch (error) {
      if (error instanceof z.ZodError) {
        fail(`Invalid OWNER input: ${error.issues[0]?.message ?? "validation failed"}`);
      } else {
        fail(getErrorMessage(error));
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}
