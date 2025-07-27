import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Verificar padrões de usuários de teste
    const usersWithOldTestClerkId = await prisma.user.count({
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

    const usersWithOldTestEmail = await prisma.user.count({
      where: {
        AND: [
          {
            email: {
              startsWith: 'test'
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

    const usersWithCorrectPattern = await prisma.user.count({
      where: {
        email: {
          startsWith: 'test-love2share'
        }
      }
    })

    const allTestUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            clerkId: {
              startsWith: 'test_'
            }
          },
          {
            email: {
              startsWith: 'test'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        clerkId: true,
        name: true
      }
    })

    const suggestions = []
    
    if (usersWithOldTestClerkId > 0) {
      suggestions.push(`Execute "Migrar Usuários de Teste" para atualizar ${usersWithOldTestClerkId} usuários com clerkId antigo`)
    }
    
    if (usersWithOldTestEmail > 0) {
      suggestions.push(`${usersWithOldTestEmail} usuários têm emails de teste antigos que podem ser atualizados`)
    }
    
    if (usersWithCorrectPattern === 0 && allTestUsers.length === 0) {
      suggestions.push('Nenhum usuário de teste encontrado. Use "Popular Dados de Teste" para começar')
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ Todos os usuários de teste seguem o padrão correto!')
    }

    return NextResponse.json({
      success: true,
      message: 'Verificação de usuários de teste concluída',
      data: {
        statistics: {
          usersWithCorrectPattern,
          usersWithOldTestClerkId,
          usersWithOldTestEmail,
          totalTestUsers: allTestUsers.length
        },
        currentPattern: 'test-love2share.{random}.{nome}@domain.com',
        testUsers: allTestUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          clerkId: user.clerkId,
          followsPattern: user.email.startsWith('test-love2share'),
          needsMigration: user.clerkId.startsWith('test_') && !user.email.startsWith('test-love2share')
        })),
        suggestions,
        actions: {
          createNew: 'Use "Criar Usuário de Teste" para novos usuários',
          migrate: 'Use "Migrar Usuários de Teste" para atualizar padrões antigos',
          populate: 'Use "Popular Dados de Teste" para setup completo',
          clean: 'Use "Limpar Usuários de Teste" para remover todos'
        }
      }
    })

  } catch (error) {
    console.error('Erro ao verificar usuários de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao verificar usuários de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
