import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import { faker } from '@faker-js/faker'

export async function POST() {
  try {
    await requireAdmin()

    // Buscar usuários existentes no banco
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true
      }
    })

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum usuário encontrado. Crie usuários de teste primeiro.'
      })
    }

    // Selecionar um usuário aleatório para ser o criador do grupo
    const randomUser = faker.helpers.arrayElement(users)

    // Gerar dados aleatórios para o grupo
    const streamingServices = [
      'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Spotify', 
      'Apple TV+', 'Paramount+', 'Crunchyroll', 'Globoplay', 'Youtube Premium'
    ]
    
    const streamingService = faker.helpers.arrayElement(streamingServices)
    const groupName = `Grupo ${streamingService} - ${faker.person.firstName()}`
    const descriptions = [
      `Compartilhamento de conta ${streamingService} entre amigos`,
      `Grupo para dividir custos do ${streamingService}`,
      `Família ${streamingService} - vamos dividir!`,
      `${streamingService} compartilhado - economize!`,
      `Grupo premium ${streamingService}`
    ]
    
    const description = faker.helpers.arrayElement(descriptions)
    const maxMembers = faker.number.int({ min: 2, max: 6 })

    // Criar o grupo
    const group = await prisma.streamingGroup.create({
      data: {
        name: groupName,
        description,
        maxMembers,
        createdById: randomUser.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Adicionar o criador como OWNER do grupo
    await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: group.id,
        userId: randomUser.id,
        role: 'OWNER',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Grupo de teste criado com sucesso!`,
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          maxMembers: group.maxMembers,
          createdAt: group.createdAt
        },
        creator: {
          name: group.createdBy.name,
          email: group.createdBy.email
        },
        note: 'Grupo criado com dados aleatórios usando Faker'
      }
    })

  } catch (error) {
    console.error('Erro ao criar grupo de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao criar grupo de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
