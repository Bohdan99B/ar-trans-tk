import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@/lib/auth";

type ManagerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ManagerPage({ params }: ManagerPageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/${locale}/manager`);
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    redirect(`/${locale}`);
  }

  redirect(`/${locale}/admin`);
}
