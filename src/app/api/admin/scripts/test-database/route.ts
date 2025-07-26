import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Teste básico de conexão
    await prisma.$queryRaw`SELECT 1 as test`
    
    // Contar registros
    const [userCount, groupCount, streamingCount, activeStreamingCount] = await Promise.all([
      prisma.user.count(),
      prisma.streamingGroup.count(),
      prisma.streaming.count(),
      prisma.streaming.count({ where: { isActive: true } })
    ])
    
    // Listar streamings
    const streamings = await prisma.streaming.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        monthlyPrice: true,
        maxUsers: true
      },
      orderBy: { name: 'asc' }
    })

    const data = {
      database: {
        connection: 'OK',
        responseTime: Date.now() // Mock response time
      },
      counts: {
        users: userCount,
        groups: groupCount,
        streamings: streamingCount,
        activeStreamings: activeStreamingCount
      },
      streamings: streamings.map(s => ({
        id: s.id.slice(0, 8) + '...',
        name: s.name,
        status: s.isActive ? 'Ativo' : 'Inativo',
        price: s.monthlyPrice ? `R$ ${s.monthlyPrice}` : 'N/A',
        maxUsers: s.maxUsers
      }))
    }

    return NextResponse.json({
      success: true,
      message: `Banco de dados funcionando! ${streamingCount} streamings encontrados.`,
      data
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar banco de dados: ' + (error as Error).message
    })
  }
}
