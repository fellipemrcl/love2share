import InvitesManagement from "@/components/InvitesManagement";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

export default function InvitesPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Gerenciar Convites"
        description="Gerencie suas solicitações e convites de participação em grupos"
        breadcrumbItems={[
          { label: "Convites" }
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <InvitesManagement />
        </div>
      </div>
    </PageLayout>
  );
}
