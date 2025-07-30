import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import SavingsClient from "@/components/SavingsClient/index";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Minhas Economias | Love2Share",
  description: "Veja quanto você está economizando compartilhando streamings com outros usuários",
};

export default async function SavingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <PageLayout>
      <PageHeader
        title="Minhas Economias"
        description="Veja quanto você está economizando compartilhando streamings com outros usuários"
        breadcrumbItems={[
          { label: "Economias" }
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <SavingsClient />
      </div>
    </PageLayout>
  );
}
