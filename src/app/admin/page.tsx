import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    redirect('/')
  }

  return <AdminDashboard />
}
