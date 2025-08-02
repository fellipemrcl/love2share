import prisma from '../src/lib/prisma'

async function testCreateGroup() {
  try {
    console.log('🔍 Testando criação de grupo...')
    
    // Primeiro, vamos buscar um streaming disponível
    const streaming = await prisma.streaming.findFirst({
      where: { isActive: true }
    })
    
    if (!streaming) {
      console.log('❌ Nenhum streaming disponível')
      return
    }
    
    console.log(`📺 Usando streaming: ${streaming.name}`)
    
    // Vamos criar um usuário de teste (simulando o que acontece na API)
    const testUser = await prisma.user.upsert({
      where: { email: 'test@test.com' },
      create: {
        clerkId: 'test-clerk-id',
        email: 'test@test.com',
        name: 'Usuário Teste'
      },
      update: {}
    })
    
    console.log(`👤 Usuário de teste: ${testUser.name}`)
    
    // Criar o grupo
    const groupName = `Grupo de ${streaming.name} de ${testUser.name}`
    const group = await prisma.streamingGroup.create({
      data: {
        name: groupName,
        description: `Compartilhamento da conta ${streaming.name}`,
        maxMembers: 3,
        createdById: testUser.id,
      },
    })
    
    console.log(`📁 Grupo criado: ${group.name} (ID: ${group.id.slice(0, 8)}...)`)
    
    // Adicionar o usuário como dono
    await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: group.id,
        userId: testUser.id,
        role: 'OWNER',
      },
    })
    
    console.log(`👑 Usuário adicionado como OWNER`)
    
    // Criar relacionamento com o streaming
    await prisma.streamingGroupStreaming.create({
      data: {
        streamingGroupId: group.id,
        streamingId: streaming.id,
        accountEmail: '',
        accountPassword: '',
        isAccountOwner: true,
        accountOwnerId: testUser.id,
      },
    })
    
    console.log(`🔗 Relacionamento com streaming criado`)
    
    console.log('✅ Teste de criação de grupo bem-sucedido!')
    
  } catch (error) {
    console.error('❌ Erro ao testar criação de grupo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateGroup()
