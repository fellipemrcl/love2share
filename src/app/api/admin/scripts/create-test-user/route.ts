import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import { faker } from '@faker-js/faker'

export async function POST() {
  try {
    await requireAdmin()

    // Gerar dados aleatórios para o usuário
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const fullName = `${firstName} ${lastName}`
    const email = faker.internet.email({ firstName, lastName }).toLowerCase()
    
    // Gerar um clerkId fictício único para teste
    const clerkId = `test_${faker.string.uuid()}`

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Se já existe, tentar novamente com um email diferente
      const randomNumber = faker.number.int({ min: 100, max: 999 })
      const newEmail = faker.internet.email({ firstName: firstName + randomNumber, lastName }).toLowerCase()
      
      const user = await prisma.user.create({
        data: {
          clerkId,
          email: newEmail,
          name: fullName,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Usuário de teste criado com sucesso!`,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          clerkId: user.clerkId,
          note: 'Este é um usuário de teste com clerkId fictício'
        }
      })
    }

    // Criar o usuário de teste
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name: fullName,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Usuário de teste criado com sucesso!`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        clerkId: user.clerkId,
        note: 'Este é um usuário de teste com clerkId fictício'
      }
    })

  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao criar usuário de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
