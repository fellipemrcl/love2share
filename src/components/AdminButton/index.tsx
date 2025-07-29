'use client'

import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function AdminButton() {
  const { user } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        setIsAdmin(false)
        return
      }

      try {
        // Fazer uma verificação no backend para confirmar se é admin
        const response = await fetch('/api/admin/manage-admins')
        const data = await response.json()
        
        if (data.success && data.admins) {
          setIsAdmin(data.admins.includes(user.primaryEmailAddress.emailAddress))
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  if (!isAdmin) {
    return null
  }

  return (
    <Link href="/admin">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Admin
      </Button>
    </Link>
  )
}
