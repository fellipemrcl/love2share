import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Buscar todos os usuários com informações detalhadas
    const users = await prisma.user.findMany({
      include: {
        streamingGroupUsers: {
          include: {
            streamingGroup: {
              select: {
                id: true,
                name: true,
                description: true,
                maxMembers: true,
                createdAt: true
              }
            }
          }
        },
        createdGroups: {
          select: {
            id: true,
            name: true,
            description: true,
            maxMembers: true,
            createdAt: true,
            _count: {
              select: {
                streamingGroupUsers: true
              }
            }
          }
        },
        _count: {
          select: {
            streamingGroupUsers: true,
            createdGroups: true
          }
        }
      }
    })

    // Separar usuários de teste (que têm clerkId começando com "test_")
    const testUsers = users.filter(user => user.clerkId.startsWith('test_'))
    const realUsers = users.filter(user => !user.clerkId.startsWith('test_'))

    // Estatísticas gerais
    const stats = {
      totalUsers: users.length,
      testUsers: testUsers.length,
      realUsers: realUsers.length,
      totalGroups: await prisma.streamingGroup.count(),
      totalMemberships: await prisma.streamingGroupUser.count()
    }

    // Formatar dados dos usuários de teste para exibição
    const formattedTestUsers = testUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      clerkId: user.clerkId,
      isTestUser: true,
      statistics: {
        groupsAsMember: user._count.streamingGroupUsers,
        groupsCreated: user._count.createdGroups,
        totalGroups: user._count.streamingGroupUsers + user._count.createdGroups
      },
      memberships: user.streamingGroupUsers.map(membership => ({
        groupId: membership.streamingGroup.id,
        groupName: membership.streamingGroup.name,
        role: membership.role,
        joinedAt: membership.createdAt
      })),
      createdGroups: user.createdGroups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        currentMembers: group._count.streamingGroupUsers,
        maxMembers: group.maxMembers,
        createdAt: group.createdAt
      }))
    }))

    // Grupos sem membros ou com poucas pessoas
    const groupsWithLowMembers = await prisma.streamingGroup.findMany({
      include: {
        _count: {
          select: {
            streamingGroupUsers: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedGroups = groupsWithLowMembers.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      currentMembers: group._count.streamingGroupUsers,
      maxMembers: group.maxMembers,
      hasVacancies: group._count.streamingGroupUsers < group.maxMembers,
      vacancies: group.maxMembers - group._count.streamingGroupUsers,
      createdBy: group.createdBy,
      createdAt: group.createdAt
    }))

    return NextResponse.json({
      success: true,
      message: 'Dados de usuários e grupos recuperados com sucesso',
      data: {
        statistics: stats,
        testUsers: formattedTestUsers,
        groups: formattedGroups,
        suggestions: {
          canCreateMoreUsers: testUsers.length < 10,
          groupsNeedingMembers: formattedGroups.filter(g => g.hasVacancies).length,
          emptyGroups: formattedGroups.filter(g => g.currentMembers === 1).length // Só tem o criador
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar usuários de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao listar usuários de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
