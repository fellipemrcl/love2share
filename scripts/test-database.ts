import prisma from '../src/lib/prisma'

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...')
    
    // Teste básico de conexão
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão com banco OK')
    
    // Contar streamings
    const streamingCount = await prisma.streaming.count()
    console.log(`📊 Total de streamings no banco: ${streamingCount}`)
    
    // Listar streamings
    const streamings = await prisma.streaming.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        monthlyPrice: true
      }
    })
    
    console.log('📋 Streamings no banco:')
    streamings.forEach(s => {
      console.log(`  - ${s.name} (ID: ${s.id.slice(0, 8)}...) - ${s.isActive ? 'Ativo' : 'Inativo'} - R$${s.monthlyPrice || '0'}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao testar banco:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
