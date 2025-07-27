import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Criar um segundo usuário de teste
  const testUser2 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      clerkId: 'test-member-clerk-id',
      email: 'member@example.com',
      name: 'Membro de Teste',
    },
  })

  // Buscar grupos existentes
  const groups = await prisma.streamingGroup.findMany({
    include: {
      streamingGroupUsers: true,
      _count: {
        select: {
          streamingGroupUsers: true,
        },
      },
    },
  })

  // Adicionar o usuário de teste como membro em alguns grupos (onde há vagas)
  for (const group of groups) {
    if (group._count.streamingGroupUsers < group.maxMembers) {
      const existingMembership = group.streamingGroupUsers.find(
        member => member.userId === testUser2.id
      )

      if (!existingMembership) {
        await prisma.streamingGroupUser.create({
          data: {
            streamingGroupId: group.id,
            userId: testUser2.id,
            role: 'MEMBER',
          },
        })
        console.log(`✓ Usuário adicionado como membro ao grupo "${group.name}"`)
      } else {
        console.log(`- Usuário já é membro do grupo "${group.name}"`)
      }
    }
  }

  // Criar um grupo onde o testUser2 é admin
  const adminGroup = await prisma.streamingGroup.create({
    data: {
      name: 'Grupo Admin de Teste',
      description: 'Grupo onde o usuário de teste é admin',
      maxMembers: 3,
      createdById: testUser2.id,
    },
  })

  await prisma.streamingGroupUser.create({
    data: {
      streamingGroupId: adminGroup.id,
      userId: testUser2.id,
      role: 'OWNER',
    },
  })

  console.log('✅ Membros de teste adicionados com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao adicionar membros de teste:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
