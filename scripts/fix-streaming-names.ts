import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verificando streamings com nomes inconsistentes...')
    
    // Buscar o streaming "Amazon Prime Video" e atualizar para "Prime Video"
    const amazonStreaming = await prisma.streaming.findFirst({
      where: {
        name: 'Amazon Prime Video',
        platform: 'Prime Video'
      }
    })

    if (amazonStreaming) {
      console.log('📝 Encontrado streaming "Amazon Prime Video", atualizando para "Prime Video"...')
      
      await prisma.streaming.update({
        where: { id: amazonStreaming.id },
        data: {
          name: 'Prime Video'
        }
      })
      
      console.log('✅ Streaming atualizado com sucesso!')
    } else {
      console.log('ℹ️ Não foi encontrado streaming "Amazon Prime Video" para atualizar.')
    }

    // Listar todos os streamings para verificação
    const allStreamings = await prisma.streaming.findMany({
      select: {
        id: true,
        name: true,
        platform: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n📋 Streamings atuais no banco:')
    allStreamings.forEach((streaming: { id: string; name: string; platform: string }, index: number) => {
      console.log(`${index + 1}. ${streaming.name} (${streaming.platform})`)
    })

  } catch (error) {
    console.error('❌ Erro ao executar script:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
