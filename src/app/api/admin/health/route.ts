import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    // Check database health
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - dbStart

    // Mock other service checks
    const healthData = {
      database: {
        status: 'healthy' as const,
        responseTime: dbResponseTime
      },
      api: {
        status: 'healthy' as const,
        uptime: process.uptime() > 0 ? `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m` : 'Unknown'
      },
      services: {
        clerk: 'healthy' as const, // In a real app, you'd check Clerk's health endpoint
        prisma: 'healthy' as const
      }
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Error checking system health:', error)
    
    return NextResponse.json({
      database: {
        status: 'error' as const,
        responseTime: 0
      },
      api: {
        status: 'error' as const,
        uptime: 'Unknown'
      },
      services: {
        clerk: 'error' as const,
        prisma: 'error' as const
      }
    })
  }
}
