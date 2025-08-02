import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const isAdmin = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrityReport = {
      users: { issues: 0, details: [] as string[] },
      groups: { issues: 0, details: [] as string[] },
      memberships: { issues: 0, details: [] as string[] },
      streamings: { issues: 0, details: [] as string[] },
      accessData: { issues: 0, details: [] as string[] }
    }

    // Verificar usuários duplicados
    const duplicateUsers = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    })
    
    integrityReport.users.issues += duplicateUsers.length
    if (duplicateUsers.length > 0) {
      integrityReport.users.details.push(`${duplicateUsers.length} emails duplicados encontrados`)
    }

    // Verificar usuários com clerkId duplicado
    const duplicateClerkIds = await prisma.user.groupBy({
      by: ['clerkId'],
      having: {
        clerkId: {
          _count: {
            gt: 1
          }
        }
      }
    })
    
    integrityReport.users.issues += duplicateClerkIds.length
    if (duplicateClerkIds.length > 0) {
      integrityReport.users.details.push(`${duplicateClerkIds.length} clerkIds duplicados encontrados`)
    }

    // Verificar grupos sem owner
    const groupsWithoutOwner = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupUsers: {
          none: {
            role: 'OWNER'
          }
        }
      }
    })
    
    integrityReport.groups.issues += groupsWithoutOwner.length
    if (groupsWithoutOwner.length > 0) {
      integrityReport.groups.details.push(`${groupsWithoutOwner.length} grupos sem owner`)
    }

    // Verificar grupos sem streamings associados
    const groupsWithoutStreamings = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupStreamings: {
          none: {}
        }
      }
    })
    
    integrityReport.groups.issues += groupsWithoutStreamings.length
    if (groupsWithoutStreamings.length > 0) {
      integrityReport.groups.details.push(`${groupsWithoutStreamings.length} grupos sem streamings`)
    }

    // Verificar múltiplos owners no mesmo grupo
    const groupsWithMultipleOwners = await prisma.streamingGroup.findMany({
      where: {
        streamingGroupUsers: {
          some: {
            role: 'OWNER'
          }
        }
      },
      include: {
        streamingGroupUsers: {
          where: {
            role: 'OWNER'
          }
        }
      }
    })
    
    const problematicGroups = groupsWithMultipleOwners.filter(g => g.streamingGroupUsers.length > 1)
    integrityReport.memberships.issues += problematicGroups.length
    if (problematicGroups.length > 0) {
      integrityReport.memberships.details.push(`${problematicGroups.length} grupos com múltiplos owners`)
    }

    // Verificar memberships duplicados
    const duplicateMemberships = await prisma.streamingGroupUser.groupBy({
      by: ['userId', 'streamingGroupId'],
      having: {
        userId: {
          _count: {
            gt: 1
          }
        }
      }
    })
    
    integrityReport.memberships.issues += duplicateMemberships.length
    if (duplicateMemberships.length > 0) {
      integrityReport.memberships.details.push(`${duplicateMemberships.length} memberships duplicados`)
    }

    // Verificar streamings inativos sendo usados
    const inactiveStreamingsInUse = await prisma.streamingGroupStreaming.findMany({
      where: {
        streaming: {
          isActive: false
        },
        isActive: true
      },
      include: {
        streaming: true,
        streamingGroup: true
      }
    })
    
    integrityReport.streamings.issues += inactiveStreamingsInUse.length
    if (inactiveStreamingsInUse.length > 0) {
      integrityReport.streamings.details.push(`${inactiveStreamingsInUse.length} grupos usando streamings inativos`)
    }

    // Verificar dados de acesso inconsistentes
    const inconsistentAccessData = await prisma.streamingGroupUser.findMany({
      where: {
        OR: [
          {
            // Dados confirmados mas sem data de confirmação
            accessDataStatus: 'CONFIRMED',
            accessDataConfirmedAt: null
          },
          {
            // Dados enviados mas sem data de envio
            accessDataStatus: 'SENT',
            accessDataSentAt: null
          },
          {
            // Data de confirmação anterior à data de envio
            accessDataConfirmedAt: {
              not: null
            },
            accessDataSentAt: {
              not: null
            },
            AND: [
              {
                accessDataConfirmedAt: {
                  lt: prisma.streamingGroupUser.fields.accessDataSentAt
                }
              }
            ]
          }
        ]
      }
    })
    
    integrityReport.accessData.issues += inconsistentAccessData.length
    if (inconsistentAccessData.length > 0) {
      integrityReport.accessData.details.push(`${inconsistentAccessData.length} registros com dados de acesso inconsistentes`)
    }

    // Calcular score de integridade
    const totalIssues = Object.values(integrityReport).reduce((sum, category) => sum + category.issues, 0)
    const integrityScore = Math.max(0, 100 - (totalIssues * 5)) // Cada problema reduz 5 pontos

    return NextResponse.json({
      success: true,
      message: `Verificação de integridade concluída. Score: ${integrityScore}/100 (${totalIssues} problemas encontrados)`,
      data: {
        integrityScore,
        totalIssues,
        categories: integrityReport,
        recommendations: totalIssues > 0 ? [
          'Execute o script "Corrigir Dados Órfãos" para resolver problemas automáticos',
          'Revise manualmente problemas de duplicação de dados',
          'Considere limpar dados de teste se não necessários'
        ] : [
          'Banco de dados está íntegro',
          'Nenhuma ação necessária no momento'
        ]
      }
    })

  } catch (error) {
    console.error('Erro na verificação de integridade:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor na verificação de integridade'
    })
  }
}
