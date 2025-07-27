import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import FindGroupsClient from "@/components/FindGroupsClient";

export default async function FindGroupsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Buscar todos os streamings para o filtro
  const streamingsData = await prisma.streaming.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      monthlyPrice: true,
      maxUsers: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Converter para o tipo esperado pelo componente
  const streamings = streamingsData.map(s => ({
    ...s,
    logoUrl: s.logoUrl || undefined,
    monthlyPrice: s.monthlyPrice || undefined,
  }));

  return <FindGroupsClient initialStreamings={streamings} />;
}
