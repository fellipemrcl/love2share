import prisma from '@/lib/prisma'
import { AccessDataStatus } from '@/app/generated/prisma'
import { AccessDataDeliveryRequest, PendingAccessData, AccessDataStats } from '@/types/access-data'

export async function createAccessDataDelivery(request: AccessDataDeliveryRequest) {
  return await prisma.$transaction(async (tx) => {
    // Criar a entrega de dados
    const delivery = await tx.accessDataDelivery.create({
      data: {
        streamingGroupUserId: request.streamingGroupUserId,
        deliveryType: request.deliveryType,
        content: request.content,
        isInviteLink: request.isInviteLink,
        notes: request.notes,
      },
    })

    // Atualizar o status do usuário no grupo
    await tx.streamingGroupUser.update({
      where: { id: request.streamingGroupUserId },
      data: {
        accessDataStatus: AccessDataStatus.SENT,
        accessDataSentAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return delivery
  })
}

export async function confirmAccessDataReceipt(
  streamingGroupUserId: string,
  confirmed: boolean,
  notes?: string
) {
  return await prisma.$transaction(async (tx) => {
    // Atualizar o status do usuário no grupo
    const updatedUser = await tx.streamingGroupUser.update({
      where: { id: streamingGroupUserId },
      data: {
        accessDataStatus: confirmed ? AccessDataStatus.CONFIRMED : AccessDataStatus.SENT,
        accessDataConfirmedAt: confirmed ? new Date() : null,
        updatedAt: new Date(),
      },
    })

    // Se confirmado, atualizar a última entrega
    if (confirmed) {
      const latestDelivery = await tx.accessDataDelivery.findFirst({
        where: { streamingGroupUserId },
        orderBy: { sentAt: 'desc' },
      })

      if (latestDelivery) {
        await tx.accessDataDelivery.update({
          where: { id: latestDelivery.id },
          data: {
            confirmedAt: new Date(),
            notes: notes ? `${latestDelivery.notes || ''}\nConfirmação: ${notes}` : latestDelivery.notes,
          },
        })
      }
    }

    return updatedUser
  })
}

export async function markAccessDataAsOverdue(streamingGroupUserId: string) {
  return await prisma.streamingGroupUser.update({
    where: { id: streamingGroupUserId },
    data: {
      accessDataStatus: AccessDataStatus.OVERDUE,
      updatedAt: new Date(),
    },
  })
}

export async function setAccessDataDeadline(streamingGroupUserId: string) {
  const deadline = new Date()
  deadline.setHours(deadline.getHours() + 24) // 24 horas a partir de agora

  return await prisma.streamingGroupUser.update({
    where: { id: streamingGroupUserId },
    data: {
      accessDataDeadline: deadline,
      updatedAt: new Date(),
    },
  })
}

export async function getPendingAccessDataForAdmin(adminUserId: string): Promise<PendingAccessData[]> {
  const pendingUsers = await prisma.streamingGroupUser.findMany({
    where: {
      streamingGroup: {
        OR: [
          { createdById: adminUserId },
          {
            streamingGroupUsers: {
              some: {
                userId: adminUserId,
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        ],
      },
      accessDataStatus: { in: [AccessDataStatus.PENDING, AccessDataStatus.SENT] },
      role: 'MEMBER',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      streamingGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const now = new Date()

  return pendingUsers.map((user) => {
    const deadline = user.accessDataDeadline
    const daysRemaining = deadline
      ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null
    const isOverdue = deadline ? now > deadline : false

    return {
      id: user.id,
      user: {
        id: user.user.id,
        name: user.user.name || 'Usuário sem nome',
        email: user.user.email,
      },
      streamingGroup: user.streamingGroup,
      status: user.accessDataStatus,
      deadline: deadline || undefined,
      daysRemaining: daysRemaining || undefined,
      isOverdue,
    }
  })
}

export async function getAccessDataStats(adminUserId: string): Promise<AccessDataStats> {
  const pendingData = await getPendingAccessDataForAdmin(adminUserId)

  const stats = await prisma.streamingGroupUser.groupBy({
    by: ['accessDataStatus'],
    _count: {
      id: true,
    },
    where: {
      streamingGroup: {
        OR: [
          { createdById: adminUserId },
          {
            streamingGroupUsers: {
              some: {
                userId: adminUserId,
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        ],
      },
      role: 'MEMBER',
    },
  })

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.accessDataStatus] = stat._count.id
    return acc
  }, {} as Record<AccessDataStatus, number>)

  return {
    totalPending: statusCounts[AccessDataStatus.PENDING] || 0,
    totalSent: statusCounts[AccessDataStatus.SENT] || 0,
    totalConfirmed: statusCounts[AccessDataStatus.CONFIRMED] || 0,
    totalOverdue: statusCounts[AccessDataStatus.OVERDUE] || 0,
    pendingDeadlines: pendingData.filter(item => item.deadline),
  }
}

export async function getUserAccessDataHistory(streamingGroupUserId: string) {
  return await prisma.accessDataDelivery.findMany({
    where: { streamingGroupUserId },
    orderBy: { sentAt: 'desc' },
    include: {
      streamingGroupUser: {
        include: {
          streamingGroup: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })
}

// Função para ser executada em cron job para marcar dados vencidos
export async function markOverdueAccessData() {
  const now = new Date()
  
  const overdueUsers = await prisma.streamingGroupUser.findMany({
    where: {
      accessDataDeadline: {
        lt: now,
      },
      accessDataStatus: { in: [AccessDataStatus.PENDING, AccessDataStatus.SENT] },
    },
  })

  for (const user of overdueUsers) {
    await markAccessDataAsOverdue(user.id)
  }

  return overdueUsers.length
}
