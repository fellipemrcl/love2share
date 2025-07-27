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
    
    // Gerar um clerkId fictício único para teste
    const clerkId = `test_${faker.string.uuid()}`
    
    // Criar email de teste sempre começando com "test-love2share"
    const baseEmail = faker.internet.email({ firstName, lastName }).toLowerCase()
    const emailDomain = baseEmail.split('@')[1]
    const testEmail = `test-love2share.${faker.string.alphanumeric(8)}.${firstName.toLowerCase()}@${emailDomain}`

    // Verificar se já existe um usuário com este email
    let finalEmail = testEmail
    let attempt = 0
    
    while (attempt < 5) {
      const existingUser = await prisma.user.findUnique({
        where: { email: finalEmail }
      })
      
      if (!existingUser) {
        break
      }
      
      // Se já existe, gerar um novo email
      attempt++
      const randomSuffix = faker.string.alphanumeric(6)
      finalEmail = `test-love2share.${randomSuffix}.${firstName.toLowerCase()}@${emailDomain}`
    }

    // Criar o usuário de teste
    const user = await prisma.user.create({
      data: {
        clerkId,
        email: finalEmail,
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
        note: 'Este é um usuário de teste com email começando com "test-love2share" e clerkId fictício'
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
