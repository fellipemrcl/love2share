import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const isAdmin = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fixes = {
      orphanedGroupUsers: 0,
      orphanedJoinRequests: 0,
      orphanedGroupStreamings: 0,
      orphanedAccessDeliveries: 0,
      inconsistentRoles: 0
    }

    // 1. Buscar e remover membros de grupos que não existem mais
    const orphanedGroupUsersIds = await prisma.streamingGroupUser.findMany({
      where: {
        streamingGroupId: {
          notIn: (await prisma.streamingGroup.findMany({ select: { id: true } })).map(g => g.id)
        }
      },
      select: { id: true }
    })
    
    const orphanedGroupUsers = await prisma.streamingGroupUser.deleteMany({
      where: {
        id: {
          in: orphanedGroupUsersIds.map(u => u.id)
        }
      }
    })
    fixes.orphanedGroupUsers = orphanedGroupUsers.count

    // 2. Buscar e remover solicitações de grupos que não existem
    const orphanedJoinRequestsIds = await prisma.groupJoinRequest.findMany({
      where: {
        streamingGroupId: {
          notIn: (await prisma.streamingGroup.findMany({ select: { id: true } })).map(g => g.id)
        }
      },
      select: { id: true }
    })
    
    const orphanedJoinRequests = await prisma.groupJoinRequest.deleteMany({
      where: {
        id: {
          in: orphanedJoinRequestsIds.map(r => r.id)
        }
      }
    })
    fixes.orphanedJoinRequests = orphanedJoinRequests.count

    // 3. Buscar e remover associações de streaming de grupos que não existem
    const orphanedGroupStreamingsIds = await prisma.streamingGroupStreaming.findMany({
      where: {
        streamingGroupId: {
          notIn: (await prisma.streamingGroup.findMany({ select: { id: true } })).map(g => g.id)
        }
      },
      select: { id: true }
    })
    
    const orphanedGroupStreamings = await prisma.streamingGroupStreaming.deleteMany({
      where: {
        id: {
          in: orphanedGroupStreamingsIds.map(s => s.id)
        }
      }
    })
    fixes.orphanedGroupStreamings = orphanedGroupStreamings.count

    // 4. Buscar e remover entregas de dados de acesso órfãs
    const orphanedAccessDeliveriesIds = await prisma.accessDataDelivery.findMany({
      where: {
        streamingGroupUserId: {
          notIn: (await prisma.streamingGroupUser.findMany({ select: { id: true } })).map(u => u.id)
        }
      },
      select: { id: true }
    })
    
    const orphanedAccessDeliveries = await prisma.accessDataDelivery.deleteMany({
      where: {
        id: {
          in: orphanedAccessDeliveriesIds.map(d => d.id)
        }
      }
    })
    fixes.orphanedAccessDeliveries = orphanedAccessDeliveries.count

    // 5. Verificar grupos sem owner e corrigir
    const groupsWithoutOwner = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupUsers: {
          none: {
            role: 'OWNER'
          }
        }
      },
      include: {
        streamingGroupUsers: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1
        }
      }
    })

    // Promover o primeiro membro para owner
    for (const group of groupsWithoutOwner) {
      if (group.streamingGroupUsers.length > 0) {
        await prisma.streamingGroupUser.update({
          where: {
            id: group.streamingGroupUsers[0].id
          },
          data: {
            role: 'OWNER'
          }
        })
        fixes.inconsistentRoles++
      }
    }

    // 6. Verificar e limpar grupos completamente vazios
    const emptyGroups = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupUsers: {
          none: {}
        },
        streamingGroupStreamings: {
          none: {}
        }
      }
    })

    const deletedEmptyGroups = await prisma.streamingGroup.deleteMany({
      where: {
        id: {
          in: emptyGroups.map(g => g.id)
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Correção de dados órfãos concluída. ${Object.values(fixes).reduce((a, b) => a + b, 0)} problemas corrigidos`,
      data: {
        ...fixes,
        emptyGroupsDeleted: deletedEmptyGroups.count,
        groupsWithoutOwnerFixed: groupsWithoutOwner.length,
        summary: {
          totalFixes: Object.values(fixes).reduce((a, b) => a + b, 0) + deletedEmptyGroups.count,
          categories: {
            'Membros órfãos removidos': fixes.orphanedGroupUsers,
            'Solicitações órfãs removidas': fixes.orphanedJoinRequests,
            'Streamings órfãos removidos': fixes.orphanedGroupStreamings,
            'Entregas órfãs removidas': fixes.orphanedAccessDeliveries,
            'Roles inconsistentes corrigidos': fixes.inconsistentRoles,
            'Grupos vazios removidos': deletedEmptyGroups.count
          }
        }
      }
    })

  } catch (error) {
    console.error('Erro ao corrigir dados órfãos:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao corrigir dados órfãos'
    })
  }
}
