import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import FindGroupsClient from "@/components/FindGroupsClient";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

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

  return (
    <PageLayout>
      <PageHeader
        title="Encontrar Grupos"
        description="Descubra grupos de compartilhamento de streaming disponíveis"
        showBackButton={true}
        backHref="/groups"
        breadcrumbItems={[
          { label: "Grupos", href: "/groups" },
          { label: "Encontrar" }
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <FindGroupsClient initialStreamings={streamings} />
      </div>
    </PageLayout>
  );
}
