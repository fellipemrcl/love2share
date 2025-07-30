import { Suspense } from 'react'
import GroupAccessDataDashboard from '@/components/GroupAccessDataDashboard/GroupAccessDataDashboard'
import PageHeader from '@/components/PageHeader'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function GroupAccessDataPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Dados de Acesso dos Grupos"
        description="Gerencie e confirme dados de acesso dos serviços de streaming"
        breadcrumbItems={[
          { label: 'Início', href: '/' },
          { label: 'Grupos', href: '/groups' },
          { label: 'Dados de Acesso', href: '/groups/access-data' },
        ]}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Carregando...</div>}>
          <GroupAccessDataDashboard />
        </Suspense>
      </main>
    </div>
  )
}
