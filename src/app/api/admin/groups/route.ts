import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const groups = await prisma.streamingGroup.findMany({
      include: {
        _count: {
          select: {
            streamingGroupUsers: true,
            streamingGroupStreamings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Access denied or internal error' },
      { status: 403 }
    )
  }
}
