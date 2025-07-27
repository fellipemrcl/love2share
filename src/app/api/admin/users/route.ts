import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        clerkId: true,
        streamingGroupUsers: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    })

    // Add createdAt field from clerkId or use current date as fallback
    const usersWithCreatedAt = users.map(user => ({
      ...user,
      createdAt: new Date().toISOString() // Fallback since User model doesn't have createdAt
    }))

    return NextResponse.json({ users: usersWithCreatedAt })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Access denied or internal error' },
      { status: 403 }
    )
  }
}
