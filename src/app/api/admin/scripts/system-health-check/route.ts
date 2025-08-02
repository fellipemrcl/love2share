import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const isAdmin = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const healthReport = {
      database: { status: 'unknown', details: {} },
      users: { status: 'unknown', details: {} },
      groups: { status: 'unknown', details: {} },
      streamings: { status: 'unknown', details: {} },
      accessData: { status: 'unknown', details: {} }
    }

    // Verificar conexão com banco de dados
    try {
      await prisma.$queryRaw`SELECT 1`
      healthReport.database.status = 'healthy'
      healthReport.database.details = { connection: 'OK' }
    } catch {
      healthReport.database.status = 'error'
      healthReport.database.details = { error: 'Falha na conexão' }
    }

    // Verificar usuários
    try {
      const userStats = await prisma.user.aggregate({
        _count: { id: true }
      })
      
      const testUsers = await prisma.user.count({
        where: {
          email: {
            startsWith: 'test-love2share'
          }
        }
      })

      healthReport.users.status = 'healthy'
      healthReport.users.details = {
        total: userStats._count.id,
        testUsers,
        realUsers: userStats._count.id - testUsers
      }
    } catch {
      healthReport.users.status = 'error'
      healthReport.users.details = { error: 'Erro ao buscar usuários' }
    }

    // Verificar grupos
    try {
      const groupStats = await prisma.streamingGroup.aggregate({
        _count: { id: true }
      })
      
      const activeGroups = await prisma.streamingGroup.count({
        where: {
          streamingGroupStreamings: {
            some: {
              isActive: true
            }
          }
        }
      })

      const groupsWithMembers = await prisma.streamingGroup.count({
        where: {
          streamingGroupUsers: {
            some: {}
          }
        }
      })

      healthReport.groups.status = 'healthy'
      healthReport.groups.details = {
        total: groupStats._count.id,
        active: activeGroups,
        withMembers: groupsWithMembers,
        empty: groupStats._count.id - groupsWithMembers
      }
    } catch {
      healthReport.groups.status = 'error'
      healthReport.groups.details = { error: 'Erro ao buscar grupos' }
    }

    // Verificar streamings
    try {
      const streamingStats = await prisma.streaming.aggregate({
        _count: { id: true }
      })
      
      const activeStreamings = await prisma.streaming.count({
        where: { isActive: true }
      })

      healthReport.streamings.status = activeStreamings > 0 ? 'healthy' : 'warning'
      healthReport.streamings.details = {
        total: streamingStats._count.id,
        active: activeStreamings,
        inactive: streamingStats._count.id - activeStreamings
      }
    } catch {
      healthReport.streamings.status = 'error'
      healthReport.streamings.details = { error: 'Erro ao buscar streamings' }
    }

    // Verificar dados de acesso
    try {
      const accessDataStats = await prisma.streamingGroupUser.groupBy({
        by: ['accessDataStatus'],
        _count: { id: true }
      })

      const overdueCount = accessDataStats.find(s => s.accessDataStatus === 'OVERDUE')?._count.id || 0
      const pendingCount = accessDataStats.find(s => s.accessDataStatus === 'PENDING')?._count.id || 0
      const sentCount = accessDataStats.find(s => s.accessDataStatus === 'SENT')?._count.id || 0
      const confirmedCount = accessDataStats.find(s => s.accessDataStatus === 'CONFIRMED')?._count.id || 0

      healthReport.accessData.status = overdueCount > 10 ? 'warning' : 'healthy'
      healthReport.accessData.details = {
        pending: pendingCount,
        sent: sentCount,
        confirmed: confirmedCount,
        overdue: overdueCount
      }
    } catch {
      healthReport.accessData.status = 'error'
      healthReport.accessData.details = { error: 'Erro ao buscar dados de acesso' }
    }

    // Determinar status geral
    const hasErrors = Object.values(healthReport).some(check => check.status === 'error')
    const hasWarnings = Object.values(healthReport).some(check => check.status === 'warning')
    
    const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy'

    return NextResponse.json({
      success: true,
      message: `Verificação de saúde concluída. Status geral: ${overallStatus}`,
      data: {
        overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthReport
      }
    })

  } catch (error) {
    console.error('Erro na verificação de saúde:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor na verificação de saúde'
    })
  }
}
