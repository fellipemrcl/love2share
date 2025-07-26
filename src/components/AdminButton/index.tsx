'use client'

import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import Link from 'next/link'

const ADMIN_EMAIL = 'fellipemarcelmaiasilva@gmail.com'

export function AdminButton() {
  const { user } = useUser()
  
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL

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
