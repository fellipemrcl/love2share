import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar alguns streamings populares
  const streamings = [
    {
      name: 'Netflix',
      platform: 'Netflix',
      description: 'Plataforma de streaming com filmes, séries e documentários',
      logoUrl: 'https://logo.clearbit.com/netflix.com',
      websiteUrl: 'https://netflix.com',
      monthlyPrice: 45.90,
      maxUsers: 4,
      maxSimultaneousScreens: 4,
    },
    {
      name: 'Amazon Prime Video',
      platform: 'Prime Video',
      description: 'Serviço de streaming da Amazon',
      logoUrl: 'https://logo.clearbit.com/amazon.com',
      websiteUrl: 'https://primevideo.com',
      monthlyPrice: 14.90,
      maxUsers: 3,
      maxSimultaneousScreens: 3,
    },
    {
      name: 'Disney+',
      platform: 'Disney Plus',
      description: 'Streaming oficial da Disney com filmes e séries',
      logoUrl: 'https://logo.clearbit.com/disneyplus.com',
      websiteUrl: 'https://disneyplus.com',
      monthlyPrice: 33.90,
      maxUsers: 4,
      maxSimultaneousScreens: 4,
    },
    {
      name: 'HBO Max',
      platform: 'HBO Max',
      description: 'Plataforma de streaming da Warner com conteúdo premium',
      logoUrl: 'https://logo.clearbit.com/hbomax.com',
      websiteUrl: 'https://hbomax.com',
      monthlyPrice: 34.90,
      maxUsers: 3,
      maxSimultaneousScreens: 3,
    },
    {
      name: 'Spotify',
      platform: 'Spotify',
      description: 'Plataforma de streaming de música',
      logoUrl: 'https://logo.clearbit.com/spotify.com',
      websiteUrl: 'https://spotify.com',
      monthlyPrice: 21.90,
      maxUsers: 6,
      maxSimultaneousScreens: 1,
    },
  ]

  for (const streaming of streamings) {
    await prisma.streaming.upsert({
      where: { name: streaming.name },
      update: {},
      create: streaming,
    })
  }

  console.log('Streamings criados com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
