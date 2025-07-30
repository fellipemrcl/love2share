import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyGroupsClient from "@/components/MyGroupsClient";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default async function MyGroupsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <PageLayout>
      <PageHeader
        title="Meus Grupos"
        description="Gerencie suas assinaturas e compartilhamentos de streaming"
        showBackButton={true}
        backHref="/groups"
        breadcrumbItems={[
          { label: "Grupos", href: "/groups" },
          { label: "Meus Grupos" }
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/groups/find">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Encontrar Grupos
              </Button>
            </Link>
          </div>
        }
      />
      <div className="container mx-auto px-4 py-6">
        <MyGroupsClient />
      </div>
    </PageLayout>
  );
}
