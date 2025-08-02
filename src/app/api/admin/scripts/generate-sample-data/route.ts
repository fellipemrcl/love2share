import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const isAdmin = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Criar conjunto completo de dados de exemplo
    const users = []
    const groups = []
    
    // Criar 5 usuários de teste
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          clerkId: `test-love2share-user-${i}`,
          email: `test-love2share-user-${i}@example.com`,
          name: `Usuário Teste ${i}`,
        }
      })
      users.push(user)
    }

    // Buscar streamings disponíveis
    const streamings = await prisma.streaming.findMany()
    
    if (streamings.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum streaming encontrado. Execute primeiro "Configurar Streamings"'
      })
    }

    // Criar 3 grupos de teste
    for (let i = 1; i <= 3; i++) {
      const randomStreaming = streamings[Math.floor(Math.random() * streamings.length)]
      const owner = users[Math.floor(Math.random() * users.length)]
      
      const group = await prisma.streamingGroup.create({
        data: {
          name: `Grupo Teste ${i}`,
          description: `Grupo de teste criado automaticamente para ${randomStreaming.name}`,
          createdById: owner.id,
          maxMembers: randomStreaming.maxSimultaneousScreens || 4,
        }
      })

      // Criar a associação com o streaming
      await prisma.streamingGroupStreaming.create({
        data: {
          streamingGroupId: group.id,
          streamingId: randomStreaming.id,
          accountEmail: `test-account-${i}@example.com`,
          accountPassword: 'test-password-123',
          isAccountOwner: true,
          accountOwnerId: owner.id,
        }
      })

      // Adicionar owner como membro
      await prisma.streamingGroupUser.create({
        data: {
          userId: owner.id,
          streamingGroupId: group.id,
          role: 'OWNER',
        }
      })

      // Adicionar 1-2 membros aleatórios
      const membersToAdd = Math.floor(Math.random() * 2) + 1
      const availableUsers = users.filter(u => u.id !== owner.id)
      
      for (let j = 0; j < Math.min(membersToAdd, availableUsers.length); j++) {
        const member = availableUsers[j]
        await prisma.streamingGroupUser.create({
          data: {
            userId: member.id,
            streamingGroupId: group.id,
            role: 'MEMBER',
          }
        })
      }

      groups.push(group)
    }

    return NextResponse.json({
      success: true,
      message: `Dados de exemplo criados com sucesso: ${users.length} usuários e ${groups.length} grupos`,
      data: {
        users: users.length,
        groups: groups.length,
        streamings: streamings.length
      }
    })

  } catch (error) {
    console.error('Erro ao gerar dados de exemplo:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao gerar dados de exemplo'
    })
  }
}
