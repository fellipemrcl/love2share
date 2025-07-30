import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/AdminDashboard'
import PageLayout from '@/components/PageLayout'

export default async function AdminPage() {
  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    redirect('/')
  }

  return (
    <PageLayout>
      <AdminDashboard />
    </PageLayout>
  )
}
