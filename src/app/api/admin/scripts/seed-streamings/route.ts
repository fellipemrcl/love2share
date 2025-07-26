import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

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

    const results = []
    for (const streaming of streamings) {
      // Verificar se já existe
      const existing = await prisma.streaming.findFirst({
        where: { name: streaming.name }
      })

      if (!existing) {
        const result = await prisma.streaming.create({
          data: streaming
        })
        results.push(result)
      } else {
        results.push(existing)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} streamings criados/atualizados com sucesso!`,
      data: {
        count: results.length,
        streamings: results.map(s => ({ id: s.id, name: s.name, price: s.monthlyPrice }))
      }
    })
  } catch (error) {
    console.error('Error seeding streamings:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao criar streamings de exemplo'
    })
  }
}
