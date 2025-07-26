import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Contar usuários
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            streamingGroupUsers: true,
            ownedStreamingAccounts: true
          }
        }
      }
    })

    // Contar grupos
    const groups = await prisma.streamingGroup.findMany({
      include: {
        _count: {
          select: {
            streamingGroupUsers: true,
            streamingGroupStreamings: true
          }
        }
      }
    })

    // Contar streamings
    const streamingStats = await prisma.streaming.groupBy({
      by: ['isActive'],
      _count: {
        id: true
      }
    })

    // Estatísticas detalhadas
    const totalUsers = users.length
    const totalGroups = groups.length
    const usersInGroups = users.filter(u => u._count.streamingGroupUsers > 0).length
    const usersWithOwnedAccounts = users.filter(u => u._count.ownedStreamingAccounts > 0).length

    const activeStreamings = streamingStats.find(s => s.isActive)?._count.id || 0
    const inactiveStreamings = streamingStats.find(s => !s.isActive)?._count.id || 0

    const data = {
      users: {
        total: totalUsers,
        inGroups: usersInGroups,
        withOwnedAccounts: usersWithOwnedAccounts,
        details: users.slice(0, 5).map(u => ({
          email: u.email,
          name: u.name || 'Sem nome',
          groupsCount: u._count.streamingGroupUsers,
          ownedAccountsCount: u._count.ownedStreamingAccounts
        }))
      },
      groups: {
        total: totalGroups,
        avgMembersPerGroup: totalGroups > 0 ? Math.round(groups.reduce((sum, g) => sum + g._count.streamingGroupUsers, 0) / totalGroups * 100) / 100 : 0,
        avgStreamingsPerGroup: totalGroups > 0 ? Math.round(groups.reduce((sum, g) => sum + g._count.streamingGroupStreamings, 0) / totalGroups * 100) / 100 : 0
      },
      streamings: {
        active: activeStreamings,
        inactive: inactiveStreamings,
        total: activeStreamings + inactiveStreamings
      }
    }

    return NextResponse.json({
      success: true,
      message: `Estatísticas: ${totalUsers} usuários, ${totalGroups} grupos, ${activeStreamings} streamings ativos`,
      data
    })
  } catch (error) {
    console.error('Error counting users:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao contar usuários: ' + (error as Error).message
    })
  }
}
