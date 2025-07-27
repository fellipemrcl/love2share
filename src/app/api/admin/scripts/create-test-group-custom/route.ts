import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

interface CreateTestGroupRequest {
  ownerId: string
  name: string
  description: string
  maxMembers: number
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body: CreateTestGroupRequest = await request.json()
    const { ownerId, name, description, maxMembers } = body

    // Validar dados obrigatórios
    if (!ownerId || !name || !description) {
      return NextResponse.json({
        success: false,
        message: 'Campos obrigatórios: ownerId, name, description'
      }, { status: 400 })
    }

    // Validar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Validar maxMembers
    const validMaxMembers = maxMembers && maxMembers >= 2 && maxMembers <= 8 ? maxMembers : 4

    // Criar o grupo
    const group = await prisma.streamingGroup.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        maxMembers: validMaxMembers,
        createdById: ownerId,
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
        userId: ownerId,
        role: 'OWNER',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Grupo "${group.name}" criado com sucesso!`,
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          maxMembers: group.maxMembers,
          createdAt: group.createdAt
        },
        owner: {
          name: group.createdBy.name,
          email: group.createdBy.email
        }
      }
    })

  } catch (error) {
    console.error('Erro ao criar grupo de teste personalizado:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao criar grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
