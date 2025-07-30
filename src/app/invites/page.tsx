import InvitesManagement from "@/components/InvitesManagement";

export default function InvitesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gerenciar Convites</h1>
        <InvitesManagement />
      </div>
    </div>
  );
}
