import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import { faker } from '@faker-js/faker'

export async function POST() {
  try {
    await requireAdmin()

    // Buscar grupos que ainda têm vagas disponíveis
    const groups = await prisma.streamingGroup.findMany({
      include: {
        streamingGroupUsers: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (groups.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum grupo encontrado. Crie grupos de teste primeiro.'
      })
    }

    // Filtrar grupos que ainda têm vagas
    const availableGroups = groups.filter(group => 
      group.streamingGroupUsers.length < group.maxMembers
    )

    if (availableGroups.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Todos os grupos estão lotados. Crie novos grupos ou aumente o limite de membros.'
      })
    }

    // Buscar usuários que não são membros de nenhum grupo ou podem participar de mais grupos
    const users = await prisma.user.findMany({
      include: {
        streamingGroupUsers: {
          include: {
            streamingGroup: true
          }
        }
      }
    })

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum usuário encontrado. Crie usuários de teste primeiro.'
      })
    }

    // Selecionar um grupo aleatório com vagas
    const selectedGroup = faker.helpers.arrayElement(availableGroups)

    // Encontrar usuários que não são membros deste grupo específico
    const usersInGroup = selectedGroup.streamingGroupUsers.map(member => member.userId)
    const availableUsers = users.filter(user => !usersInGroup.includes(user.id))

    if (availableUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Todos os usuários já são membros do grupo "${selectedGroup.name}".`
      })
    }

    // Selecionar um usuário aleatório
    const selectedUser = faker.helpers.arrayElement(availableUsers)

    // Definir role aleatório (mais chance de ser MEMBER)
    const roles: ('MEMBER' | 'ADMIN')[] = ['MEMBER', 'MEMBER', 'MEMBER', 'ADMIN'] // 75% chance de ser MEMBER
    const role = faker.helpers.arrayElement(roles)

    // Adicionar o usuário ao grupo
    const membership = await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: selectedGroup.id,
        userId: selectedUser.id,
        role: role,
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
            name: true,
            description: true,
            maxMembers: true
          }
        }
      }
    })

    // Contar membros atuais após a adição
    const currentMembersCount = await prisma.streamingGroupUser.count({
      where: { streamingGroupId: selectedGroup.id }
    })

    return NextResponse.json({
      success: true,
      message: `Usuário adicionado ao grupo com sucesso!`,
      data: {
        user: {
          name: membership.user.name,
          email: membership.user.email,
          role: membership.role
        },
        group: {
          name: membership.streamingGroup.name,
          description: membership.streamingGroup.description,
          currentMembers: currentMembersCount,
          maxMembers: membership.streamingGroup.maxMembers,
          vacancies: membership.streamingGroup.maxMembers - currentMembersCount
        },
        membershipDetails: {
          joinedAt: membership.createdAt,
          membershipId: membership.id
        },
        note: 'Usuário adicionado com role aleatório'
      }
    })

  } catch (error) {
    console.error('Erro ao adicionar usuário ao grupo:', error)
    
    // Verificar se é erro de duplicação (usuário já é membro)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        message: 'Este usuário já é membro do grupo selecionado.'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: `Erro ao adicionar usuário ao grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
