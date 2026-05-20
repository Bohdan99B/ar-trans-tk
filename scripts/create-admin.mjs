import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password, ...nameParts] = process.argv;
const name = nameParts.join(" ") || "Director";

if (!email || !password) {
  console.error("Usage: npm run admin:create -- director@example.com 'strong-password' 'Director Name'");
  process.exit(1);
}

if (password.length < 10) {
  console.error("Password must contain at least 10 characters.");
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://transport_user:transport_password@localhost:5433/transport_company_db?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  create: {
    email: email.toLowerCase(),
    name,
    passwordHash,
    role: "ADMIN",
  },
  update: {
    name,
    passwordHash,
    role: "ADMIN",
  },
  where: { email: email.toLowerCase() },
});

await prisma.$disconnect();

console.log(`ADMIN is ready: ${email.toLowerCase()}`);
