import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Ativar todos os streamings
    const result = await prisma.streaming.updateMany({
      data: { isActive: true }
    })

    // Contar streamings ativos
    const activeCount = await prisma.streaming.count({ where: { isActive: true } })

    return NextResponse.json({
      success: true,
      message: `${result.count} streamings foram ativados. Total de streamings ativos: ${activeCount}`,
      data: {
        updatedCount: result.count,
        totalActiveCount: activeCount
      }
    })
  } catch (error) {
    console.error('Error resetting streaming status:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao ativar streamings: ' + (error as Error).message
    })
  }
}
