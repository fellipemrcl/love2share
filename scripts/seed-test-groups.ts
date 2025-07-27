import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Primeiro, criar um usuário de teste
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      clerkId: 'test-clerk-id',
      email: 'test@example.com',
      name: 'Usuário de Teste',
    },
  })

  // Buscar streamings existentes
  const netflix = await prisma.streaming.findFirst({
    where: { name: 'Netflix' },
  })

  const disney = await prisma.streaming.findFirst({
    where: { name: 'Disney+' },
  })

  if (!netflix || !disney) {
    console.log('❌ Streamings não encontrados. Execute primeiro o seed-streamings.ts')
    return
  }

  // Criar grupos de teste
  const groups = [
    {
      name: 'Grupo Netflix Premium',
      description: 'Compartilhamento de Netflix Premium para 4 pessoas',
      maxMembers: 4,
      streamingId: netflix.id,
    },
    {
      name: 'Disney+ Família',
      description: 'Conta Disney+ para toda a família',
      maxMembers: 3,
      streamingId: disney.id,
    },
    {
      name: 'Netflix + Disney Bundle',
      description: 'Pacote com Netflix e Disney+ - muito econômico!',
      maxMembers: 5,
      streamingId: netflix.id, // Vamos usar apenas Netflix para simplificar
    },
  ]

  for (const groupData of groups) {
    const existingGroup = await prisma.streamingGroup.findFirst({
      where: { name: groupData.name },
    })

    if (!existingGroup) {
      // Criar o grupo
      const group = await prisma.streamingGroup.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          maxMembers: groupData.maxMembers,
          createdById: testUser.id,
        },
      })

      // Adicionar o criador como OWNER
      await prisma.streamingGroupUser.create({
        data: {
          streamingGroupId: group.id,
          userId: testUser.id,
          role: 'OWNER',
        },
      })

      // Criar relacionamento com streaming
      await prisma.streamingGroupStreaming.create({
        data: {
          streamingGroupId: group.id,
          streamingId: groupData.streamingId,
          accountEmail: 'test@netflix.com',
          accountPassword: 'password123',
          isAccountOwner: true,
          accountOwnerId: testUser.id,
        },
      })

      console.log(`✓ Grupo "${groupData.name}" criado`)
    } else {
      console.log(`- Grupo "${groupData.name}" já existe`)
    }
  }

  console.log('✅ Grupos de teste criados com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar grupos de teste:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
