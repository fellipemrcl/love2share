import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const isAdmin = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar dados de acesso vencidos (mais de 24h sem confirmação)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const overdueMembers = await prisma.streamingGroupUser.findMany({
      where: {
        OR: [
          {
            // Dados enviados há mais de 24h mas não confirmados
            accessDataStatus: 'SENT',
            accessDataSentAt: {
              lt: oneDayAgo
            }
          },
          {
            // Dados pendentes há mais de 3 dias
            accessDataStatus: 'PENDING',
            createdAt: {
              lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          },
          {
            // Dados marcados como vencidos
            accessDataStatus: 'OVERDUE'
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        streamingGroup: {
          select: {
            name: true
          }
        }
      }
    })

    // Atualizar status dos dados vencidos
    const updatedCount = await prisma.streamingGroupUser.updateMany({
      where: {
        id: {
          in: overdueMembers.map(m => m.id)
        },
        accessDataStatus: {
          in: ['SENT', 'PENDING']
        }
      },
      data: {
        accessDataStatus: 'OVERDUE'
      }
    })

    // Buscar grupos com problemas de dados de acesso
    const groupsWithIssues = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupUsers: {
          some: {
            accessDataStatus: 'OVERDUE'
          }
        }
      },
      include: {
        streamingGroupUsers: {
          where: {
            accessDataStatus: 'OVERDUE'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Verificação concluída: ${overdueMembers.length} membros com dados vencidos encontrados`,
      data: {
        overdueCount: overdueMembers.length,
        updatedCount: updatedCount.count,
        affectedGroups: groupsWithIssues.length,
        details: {
          overdueMembers: overdueMembers.map(m => ({
            user: m.user.name || m.user.email,
            group: m.streamingGroup.name,
            status: m.accessDataStatus,
            sentAt: m.accessDataSentAt,
            daysSinceCreated: Math.floor((Date.now() - m.createdAt.getTime()) / (24 * 60 * 60 * 1000))
          })),
          groupsWithIssues: groupsWithIssues.map(g => ({
            groupName: g.name,
            overdueMembers: g.streamingGroupUsers.length
          }))
        }
      }
    })

  } catch (error) {
    console.error('Erro ao verificar dados vencidos:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao verificar dados vencidos'
    })
  }
}
