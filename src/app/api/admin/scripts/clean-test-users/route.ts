import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Buscar usuários de teste (que têm clerkId começando com "test_" OU email começando com "test-love2share")
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            clerkId: {
              startsWith: 'test_'
            }
          },
          {
            email: {
              startsWith: 'test-love2share'
            }
          }
        ]
      },
      include: {
        streamingGroupUsers: {
          include: {
            streamingGroup: {
              select: {
                name: true
              }
            }
          }
        },
        createdGroups: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                streamingGroupUsers: true
              }
            }
          }
        }
      }
    })

    if (testUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum usuário de teste encontrado para remover.',
        data: {
          removedUsers: 0,
          removedMemberships: 0,
          removedGroups: 0
        }
      })
    }

    let removedMemberships = 0
    let removedGroups = 0
    const removedUsersDetails = []

    // Para cada usuário de teste
    for (const user of testUsers) {
      const userDetails = {
        name: user.name,
        email: user.email,
        memberships: user.streamingGroupUsers.length,
        createdGroups: user.createdGroups.length
      }

      // Remover memberships do usuário (exceto os grupos criados por ele)
      const membershipCount = await prisma.streamingGroupUser.deleteMany({
        where: {
          userId: user.id,
          streamingGroup: {
            createdById: {
              not: user.id
            }
          }
        }
      })
      removedMemberships += membershipCount.count

      // Para grupos criados pelo usuário, verificar se têm outros membros
      for (const group of user.createdGroups) {
        if (group._count.streamingGroupUsers <= 1) {
          // Se o grupo só tem o criador, pode deletar o grupo inteiro
          await prisma.streamingGroupUser.deleteMany({
            where: { streamingGroupId: group.id }
          })
          
          await prisma.streamingGroup.delete({
            where: { id: group.id }
          })
          removedGroups++
        } else {
          // Se tem outros membros, transferir ownership para outro membro
          const otherMember = await prisma.streamingGroupUser.findFirst({
            where: {
              streamingGroupId: group.id,
              userId: { not: user.id }
            }
          })

          if (otherMember) {
            // Atualizar o createdBy para outro membro
            await prisma.streamingGroup.update({
              where: { id: group.id },
              data: { createdById: otherMember.userId }
            })

            // Promover o membro para OWNER
            await prisma.streamingGroupUser.update({
              where: { id: otherMember.id },
              data: { role: 'OWNER' }
            })

            // Remover o usuário de teste do grupo
            await prisma.streamingGroupUser.delete({
              where: {
                streamingGroupId_userId: {
                  streamingGroupId: group.id,
                  userId: user.id
                }
              }
            })
          }
        }
      }

      removedUsersDetails.push(userDetails)
    }

    // Finalmente, remover os usuários de teste
    const removedUsersCount = await prisma.user.deleteMany({
      where: {
        OR: [
          {
            clerkId: {
              startsWith: 'test_'
            }
          },
          {
            email: {
              startsWith: 'test-love2share'
            }
          }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      message: `${removedUsersCount.count} usuários de teste removidos com sucesso!`,
      data: {
        removedUsers: removedUsersCount.count,
        removedMemberships,
        removedGroups,
        details: removedUsersDetails,
        actions: [
          'Usuários de teste removidos',
          'Memberships em grupos removidas',
          'Grupos vazios removidos',
          'Ownership transferido quando necessário'
        ]
      }
    })

  } catch (error) {
    console.error('Erro ao limpar usuários de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao limpar usuários de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
