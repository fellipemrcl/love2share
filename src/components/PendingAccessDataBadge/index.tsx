'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function PendingAccessDataBadge() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchPendingCount()
  }, [])

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/access-data/confirm')
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.summary.needingConfirmation)
      }
    } catch (error) {
      console.error('Erro ao buscar dados pendentes:', error)
    }
  }

  if (pendingCount === 0) {
    return null
  }

  return (
    <Badge variant="destructive" className="ml-2 text-xs">
      {pendingCount}
    </Badge>
  )
}
