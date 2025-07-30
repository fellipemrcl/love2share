import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Central de Ajuda"
        description="Encontre respostas para suas dúvidas sobre o Love2Share"
        breadcrumbItems={[
          { label: "Ajuda" }
        ]}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Como funciona o compartilhamento de streaming?</h4>
                <p className="text-muted-foreground text-sm">
                  Você pode se juntar a grupos criados por outros usuários para dividir os custos das assinaturas de streaming. Cada grupo tem um número máximo de membros baseado no plano do serviço.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Como posso me juntar a um grupo?</h4>
                <p className="text-muted-foreground text-sm">
                  Vá para a página &ldquo;Encontrar Grupos&rdquo;, escolha um grupo disponível e clique em &ldquo;Solicitar Entrada&rdquo;. O administrador do grupo irá analisar sua solicitação.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Como vejo minhas economias?</h4>
                <p className="text-muted-foreground text-sm">
                  Na página &ldquo;Minhas Economias&rdquo; você pode ver quanto está economizando mensalmente e anualmente com o compartilhamento de streamings.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Posso gerenciar um grupo?</h4>
                <p className="text-muted-foreground text-sm">
                  Sim! Como criador ou administrador de um grupo, você pode gerenciar membros, aprovar solicitações e configurar os serviços de streaming.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Links úteis */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Começar Agora</CardTitle>
                <CardDescription>
                  Explore as funcionalidades da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/groups/find">
                  <Button variant="outline" className="w-full justify-start">
                    Encontrar Grupos
                  </Button>
                </Link>
                <Link href="/groups/my">
                  <Button variant="outline" className="w-full justify-start">
                    Meus Grupos
                  </Button>
                </Link>
                <Link href="/savings">
                  <Button variant="outline" className="w-full justify-start">
                    Ver Economias
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precisa de mais ajuda?</CardTitle>
                <CardDescription>
                  Entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Online
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
