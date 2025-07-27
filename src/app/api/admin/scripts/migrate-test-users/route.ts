import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import { faker } from '@faker-js/faker'

export async function POST() {
  try {
    await requireAdmin()

    // Buscar usuários que têm clerkId de teste mas email que não começa com "test-love2share"
    const usersToMigrate = await prisma.user.findMany({
      where: {
        AND: [
          {
            clerkId: {
              startsWith: 'test_'
            }
          },
          {
            email: {
              not: {
                startsWith: 'test-love2share'
              }
            }
          }
        ]
      }
    })

    if (usersToMigrate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum usuário de teste precisa ser migrado. Todos já seguem o padrão correto.',
        data: {
          migratedUsers: 0,
          details: []
        }
      })
    }

    const migrationResults = []

    for (const user of usersToMigrate) {
      // Gerar novo email de teste
      const originalEmail = user.email
      const domain = originalEmail.split('@')[1] || 'example.com'
      const firstName = user.name?.split(' ')[0]?.toLowerCase() || 'user'
      const randomSuffix = faker.string.alphanumeric(8)
      
      let newTestEmail = `test-love2share.${randomSuffix}.${firstName}@${domain}`
      let attempt = 0

      // Garantir que o email seja único
      while (attempt < 5) {
        const existingUser = await prisma.user.findUnique({
          where: { email: newTestEmail }
        })
        
        if (!existingUser) {
          break
        }
        
        attempt++
        const newSuffix = faker.string.alphanumeric(8)
        newTestEmail = `test-love2share.${newSuffix}.${firstName}@${domain}`
      }

      // Atualizar o usuário
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { email: newTestEmail }
      })

      migrationResults.push({
        userId: user.id,
        name: user.name,
        oldEmail: originalEmail,
        newEmail: updatedUser.email,
        clerkId: user.clerkId
      })
    }

    return NextResponse.json({
      success: true,
      message: `${usersToMigrate.length} usuários de teste migrados com sucesso!`,
      data: {
        migratedUsers: usersToMigrate.length,
        details: migrationResults,
        note: 'Todos os usuários de teste agora têm emails começando com "test-love2share"'
      }
    })

  } catch (error) {
    console.error('Erro ao migrar usuários de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao migrar usuários de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
