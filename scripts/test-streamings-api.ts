import prisma from '../src/lib/prisma'

async function testStreamingsAPI() {
  try {
    console.log('🔍 Testando API de streamings...')
    
    // Simular o que a API /api/streamings faz
    const streamings = await prisma.streaming.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log(`📺 Streamings ativos encontrados: ${streamings.length}`)
    
    streamings.forEach(streaming => {
      console.log(`  - ${streaming.name}: R$${streaming.monthlyPrice} (${streaming.maxSimultaneousScreens} telas, máx ${streaming.maxUsers} usuários)`)
    })
    
    if (streamings.length === 0) {
      console.log('❌ Nenhum streaming ativo encontrado!')
    } else {
      console.log('✅ API de streamings funcionando corretamente!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API de streamings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStreamingsAPI()
