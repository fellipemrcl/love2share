import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function POST() {
  try {
    await requireAdmin()

    const results = []
    let totalUsers = 0
    let totalGroups = 0
    let totalMemberships = 0

    // Criar 5 usuários de teste
    for (let i = 0; i < 5; i++) {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/scripts/create-test-user`, {
        method: 'POST',
      })
      
      if (userResponse.ok) {
        totalUsers++
        const userData = await userResponse.json()
        results.push(`✅ Usuário criado: ${userData.data?.name}`)
      }
    }

    // Esperar um pouco para garantir que os usuários foram criados
    await new Promise(resolve => setTimeout(resolve, 500))

    // Criar 3 grupos de teste
    for (let i = 0; i < 3; i++) {
      const groupResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/scripts/create-test-group`, {
        method: 'POST',
      })
      
      if (groupResponse.ok) {
        totalGroups++
        const groupData = await groupResponse.json()
        results.push(`✅ Grupo criado: ${groupData.data?.group?.name}`)
      }
    }

    // Esperar um pouco
    await new Promise(resolve => setTimeout(resolve, 500))

    // Adicionar usuários aos grupos (tentar 8 vezes para criar várias combinações)
    for (let i = 0; i < 8; i++) {
      const memberResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/scripts/add-user-to-group`, {
        method: 'POST',
      })
      
      if (memberResponse.ok) {
        totalMemberships++
        const memberData = await memberResponse.json()
        results.push(`✅ ${memberData.data?.user?.name} adicionado ao grupo ${memberData.data?.group?.name}`)
      } else {
        const errorData = await memberResponse.json()
        results.push(`⚠️ ${errorData.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ambiente de teste populado com sucesso!`,
      data: {
        summary: {
          usersCreated: totalUsers,
          groupsCreated: totalGroups,
          membershipsCreated: totalMemberships
        },
        details: results,
        recommendations: [
          'Use "Gerenciar Usuários de Teste" para ver todos os dados criados',
          'Use "Adicionar Usuário a Grupo" para criar mais conexões',
          'Use "Limpar Usuários de Teste" quando quiser resetar tudo'
        ]
      }
    })

  } catch (error) {
    console.error('Erro ao popular ambiente de teste:', error)
    
    return NextResponse.json({
      success: false,
      message: `Erro ao popular ambiente de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }, { status: 500 })
  }
}
