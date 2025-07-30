import { AccessDataStatus, AccessDataDeliveryType } from '@/app/generated/prisma'

export interface AccessDataDeliveryRequest {
  streamingGroupUserId: string
  deliveryType: AccessDataDeliveryType
  content: string
  isInviteLink: boolean
  notes?: string
}

export interface AccessDataConfirmationRequest {
  streamingGroupUserId: string
  accessDeliveryId?: string
  confirmed: boolean
  notes?: string
}

export interface AccessDataStatusUpdate {
  streamingGroupUserId: string
  status: AccessDataStatus
  deadline?: Date
}

export interface PendingAccessData {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  streamingGroup: {
    id: string
    name: string
  }
  status: AccessDataStatus
  deadline?: Date
  daysRemaining?: number
  isOverdue: boolean
}

export interface AccessDataStats {
  totalPending: number
  totalSent: number
  totalConfirmed: number
  totalOverdue: number
  pendingDeadlines: PendingAccessData[]
}
