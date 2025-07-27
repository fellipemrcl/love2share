import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { searchType, searchValue } = body

    if (!searchType || !searchValue) {
      return NextResponse.json({
        success: false,
        message: 'Tipo de busca e valor são obrigatórios'
      })
    }

    // Construir o filtro baseado no tipo de busca
    let whereClause: Record<string, unknown> = {}

    switch (searchType) {
      case 'id':
        whereClause = { id: searchValue }
        break
      case 'email':
        whereClause = { email: { contains: searchValue, mode: 'insensitive' } }
        break
      case 'clerkId':
        whereClause = { clerkId: searchValue }
        break
      case 'name':
        whereClause = { name: { contains: searchValue, mode: 'insensitive' } }
        break
      default:
        return NextResponse.json({
          success: false,
          message: 'Tipo de busca inválido. Use: id, email, clerkId ou name'
        })
    }

    // Primeiro, buscar o usuário para verificar se existe e obter informações
    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        streamingGroupUsers: {
          include: {
            streamingGroup: true
          }
        },
        ownedStreamingAccounts: {
          include: {
            streamingGroup: true,
            streaming: true
          }
        },
        createdGroups: {
          include: {
            streamingGroupUsers: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: `Nenhum usuário encontrado com ${searchType}: "${searchValue}"`
      })
    }

    // Contar relacionamentos antes de deletar
    const groupMemberships = user.streamingGroupUsers.length
    const ownedAccounts = user.ownedStreamingAccounts.length
    const createdGroups = user.createdGroups.length

    // Deletar relacionamentos manualmente na ordem correta para evitar erros de foreign key
    
    // 1. Primeiro, remover o usuário como proprietário de contas de streaming
    await prisma.streamingGroupStreaming.updateMany({
      where: { accountOwnerId: user.id },
      data: { 
        accountOwnerId: null,
        isAccountOwner: false 
      }
    })

    // 2. Deletar todas as participações do usuário em grupos
    await prisma.streamingGroupUser.deleteMany({
      where: { userId: user.id }
    })

    // 3. Para grupos criados pelo usuário, temos algumas opções:
    // Opção escolhida: deletar grupos vazios, transferir grupos com membros para o primeiro membro
    for (const group of user.createdGroups) {
      const otherMembers = group.streamingGroupUsers.filter(member => member.userId !== user.id)
      
      if (otherMembers.length === 0) {
        // Grupo vazio, pode deletar completamente
        await prisma.streamingGroupStreaming.deleteMany({
          where: { streamingGroupId: group.id }
        })
        await prisma.streamingGroup.delete({
          where: { id: group.id }
        })
      } else {
        // Transferir propriedade para o primeiro membro restante
        const newOwner = otherMembers[0]
        await prisma.streamingGroup.update({
          where: { id: group.id },
          data: { createdById: newOwner.userId }
        })
        // Promover o novo dono para OWNER se não for
        await prisma.streamingGroupUser.update({
          where: { 
            streamingGroupId_userId: {
              streamingGroupId: group.id,
              userId: newOwner.userId
            }
          },
          data: { role: 'OWNER' }
        })
      }
    }

    // 4. Finalmente, deletar o usuário
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({
      success: true,
      message: `Usuário "${user.name || user.email}" foi removido com sucesso. Grupos vazios foram deletados e grupos com outros membros tiveram a propriedade transferida.`,
      data: {
        deletedUser: {
          id: user.id,
          email: user.email,
          name: user.name,
          clerkId: user.clerkId
        },
        removedRelationships: {
          groupMemberships,
          ownedAccounts,
          createdGroups
        }
      }
    })
  } catch (error) {
    console.error('Error removing user:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao remover usuário: ' + (error as Error).message
    })
  }
}
