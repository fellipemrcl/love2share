import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Exportar dados principais
    const [users, groups, streamings, groupUsers, groupStreamings] = await Promise.all([
      prisma.user.findMany(),
      prisma.streamingGroup.findMany(),
      prisma.streaming.findMany(),
      prisma.streamingGroupUser.findMany(),
      prisma.streamingGroupStreaming.findMany()
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users: users.length,
        groups: groups.length,
        streamings: streamings.length,
        groupUsers: groupUsers.length,
        groupStreamings: groupStreamings.length
      },
      // Não incluir dados sensíveis no backup por segurança
      metadata: {
        streamings: streamings.map(s => ({
          name: s.name,
          platform: s.platform,
          isActive: s.isActive,
          monthlyPrice: s.monthlyPrice
        }))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Backup gerado com dados de ${users.length} usuários, ${groups.length} grupos e ${streamings.length} streamings`,
      data: backup
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao gerar backup: ' + (error as Error).message
    })
  }
}
