import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Contar antes de deletar
    const countBefore = await prisma.streaming.count()

    // Deletar todos os streamings
    const result = await prisma.streaming.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `${countBefore} streamings foram removidos do banco de dados.`,
      data: {
        deletedCount: result.count,
        previousCount: countBefore
      }
    })
  } catch (error) {
    console.error('Error cleaning streamings:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao limpar streamings: ' + (error as Error).message
    })
  }
}
