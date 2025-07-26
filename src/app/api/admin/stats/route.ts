import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const [totalUsers, totalGroups, totalStreamings, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.streamingGroup.count(),
      prisma.streaming.count({ where: { isActive: true } }),
      prisma.streamingGroupStreaming.count({ where: { isActive: true } })
    ])

    return NextResponse.json({
      totalUsers,
      totalGroups,
      totalStreamings,
      activeSubscriptions
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Access denied or internal error' },
      { status: 403 }
    )
  }
}
