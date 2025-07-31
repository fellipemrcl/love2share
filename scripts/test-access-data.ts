import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testando sistema de dados de acesso...')

  // Buscar usuários de teste
  const admin = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
  })

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      clerkId: 'member-clerk-id',
      email: 'member@example.com',
      name: 'Membro de Teste',
    },
  })

  if (!admin) {
    console.log('❌ Usuário admin não encontrado. Execute seed-test-groups.ts primeiro')
    return
  }

  // Buscar um grupo de teste
  const testGroup = await prisma.streamingGroup.findFirst({
    where: { createdById: admin.id },
  })

  if (!testGroup) {
    console.log('❌ Grupo de teste não encontrado. Execute seed-test-groups.ts primeiro')
    return
  }

  console.log(`📋 Usando grupo: ${testGroup.name}`)

  // Adicionar membro ao grupo se não existir
  const membership = await prisma.streamingGroupUser.upsert({
    where: {
      streamingGroupId_userId: {
        streamingGroupId: testGroup.id,
        userId: member.id,
      },
    },
    update: {},
    create: {
      streamingGroupId: testGroup.id,
      userId: member.id,
      role: 'MEMBER',
      accessDataStatus: 'SENT', // Simular que dados foram enviados
      accessDataSentAt: new Date(),
      accessDataDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h no futuro
    },
  })

  console.log(`👤 Membro adicionado: ${member.email}`)

  // Criar dados de acesso de teste
  await prisma.accessDataDelivery.create({
    data: {
      streamingGroupUserId: membership.id,
      deliveryType: 'CREDENTIALS',
      content: `Email: netflix.grupo@exemplo.com
Senha: SenhaSegura123!

Instruções:
1. Acesse netflix.com
2. Faça login com as credenciais acima
3. Selecione seu perfil
4. Aproveite!`,
      isInviteLink: false,
      notes: 'Dados de teste para o sistema de acesso. Use apenas para fins de desenvolvimento.',
    },
  })

  console.log('✅ Dados de acesso criados com sucesso!')

  // Criar também um link de convite como exemplo
  await prisma.accessDataDelivery.create({
    data: {
      streamingGroupUserId: membership.id,
      deliveryType: 'INVITE_LINK',
      content: 'https://disney-plus-link-convite.exemplo.com/join/abc123',
      isInviteLink: true,
      notes: 'Link de convite válido por 7 dias',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    },
  })

  console.log('✅ Link de convite criado com sucesso!')

  console.log(`
🎯 Teste configurado! 

Para testar como membro:
1. Faça login com: member@example.com
2. Vá para: /groups/access-data
3. Você deve ver os dados de acesso na aba "Como Membro"

Para testar como admin:
1. Faça login com: test@example.com  
2. Vá para: /groups/access-data
3. Você deve ver o membro pendente na aba "Como Administrador"

Dados criados:
- Email: ${member.email}
- Grupo: ${testGroup.name}
- Status: SENT (aguardando confirmação)
- Tipos: CREDENTIALS e INVITE_LINK
`)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
