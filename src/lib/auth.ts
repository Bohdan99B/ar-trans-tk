import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/owner-account";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          select: { role: true },
          where: { id: user.id },
        });
        token.role = dbUser?.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      name: "Email and password",
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          email: user.email,
          id: user.id,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    select: { email: true, id: true, name: true, role: true },
    where: { id: session.user.id },
  });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || (!isAdminRole(user.role) && user.role !== "MANAGER")) {
    return null;
  }

  return user;
}
