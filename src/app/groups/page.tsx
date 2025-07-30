import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Settings } from "lucide-react";
import Link from "next/link";

export default async function GroupsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <PageLayout>
      <PageHeader
        title="Grupos de Streaming"
        description="Gerencie e descubra grupos para compartilhar streamings"
        breadcrumbItems={[
          { label: "Grupos" }
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Ações rápidas */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Encontrar Grupos
                </CardTitle>
                <CardDescription>
                  Descubra grupos disponíveis para se juntar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore grupos criados por outros usuários e encontre os streamings que você deseja compartilhar.
                </p>
                <Link href="/groups/find">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Grupos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Meus Grupos
                </CardTitle>
                <CardDescription>
                  Gerencie os grupos que você participa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Veja todos os grupos dos quais você faz parte e gerencie suas participações.
                </p>
                <Link href="/groups/my">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Ver Meus Grupos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre grupos */}
          <Card>
            <CardHeader>
              <CardTitle>Como funcionam os grupos?</CardTitle>
              <CardDescription>
                Entenda o sistema de compartilhamento de streamings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">🔍 Encontrar Grupos</h4>
                <p className="text-sm text-muted-foreground">
                  Navegue pelos grupos disponíveis, filtre por serviço de streaming e solicite entrada nos que interessar.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">👥 Participar</h4>
                <p className="text-sm text-muted-foreground">
                  Após aprovação, você terá acesso às credenciais compartilhadas e dividirá os custos com outros membros.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">💰 Economizar</h4>
                <p className="text-sm text-muted-foreground">
                  Pague apenas uma fração do valor total da assinatura e tenha acesso completo ao serviço.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">⚙️ Gerenciar</h4>
                <p className="text-sm text-muted-foreground">
                  Como administrador, você pode gerenciar membros, aprovar solicitações e configurar os serviços.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Links úteis */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/invites">
              <Button variant="outline" size="sm">
                Ver Convites Pendentes
              </Button>
            </Link>
            <Link href="/savings">
              <Button variant="outline" size="sm">
                Minhas Economias
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="sm">
                Central de Ajuda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
