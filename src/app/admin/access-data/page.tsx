import { Suspense } from 'react'
import AccessDataManagement from '@/components/AccessDataManagement/AccessDataManagement'
import PageHeader from '@/components/PageHeader'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AccessDataManagementPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Verificar se é admin (ou se devemos permitir para owners/admins de grupos)
  // Por enquanto, permitir para todos os usuários logados já que eles só verão seus próprios grupos
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gerenciar Dados de Acesso"
        description="Envie dados de acesso para membros dos seus grupos de streaming"
        breadcrumbItems={[
          { label: 'Início', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Dados de Acesso', href: '/admin/access-data' },
        ]}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Carregando...</div>}>
          <AccessDataManagement />
        </Suspense>
      </main>
    </div>
  )
}
